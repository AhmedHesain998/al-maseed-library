
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
    fetch: withSupabase(
        { auth: "publishable" },
        async (req, ctx) => {
            try {
                // 1. Allow POST requests only
                if (req.method !== "POST") {
                    return Response.json(
                        { error: "Method not allowed" },
                        { status: 405 }
                    );
                }

                // 2. Validate JSON body
                let body: any;

                try {
                    body = await req.json();
                } catch {
                    return Response.json(
                        { error: "Invalid JSON body." },
                        { status: 400 }
                    );
                }

                // 3. Ensure body is a valid object
                if (
                    !body ||
                    typeof body !== "object" ||
                    Array.isArray(body)
                ) {
                    return Response.json(
                        { error: "Invalid request body." },
                        { status: 400 }
                    );
                }

                // 4. UUID validation
                const uuidRegex =
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

                // 5. Validate idempotency key
                const idempotencyKey = body.idempotency_key;

                if (
                    typeof idempotencyKey !== "string" ||
                    !uuidRegex.test(idempotencyKey)
                ) {
                    return Response.json(
                        { error: "Invalid idempotency key." },
                        { status: 400 }
                    );
                }

                // 6. Validate customer information
                const customerName =
                    typeof body.customer_name === "string"
                        ? body.customer_name.trim()
                        : "";

                const customerPhone =
                    typeof body.customer_phone === "string"
                        ? body.customer_phone.trim()
                        : "";

                const address =
                    typeof body.address === "string"
                        ? body.address.trim()
                        : "";

                const language = body.language;
                const cartItems = body.items;

                if (
                    !customerName ||
                    customerName.length > 120 ||
                    !customerPhone ||
                    customerPhone.length > 30 ||
                    !address ||
                    address.length > 500
                ) {
                    return Response.json(
                        { error: "Invalid customer information." },
                        { status: 400 }
                    );
                }

                // 7. Validate language
                if (!["ar", "en"].includes(language)) {
                    return Response.json(
                        { error: "Invalid language." },
                        { status: 400 }
                    );
                }

                // 8. Validate cart
                if (
                    !Array.isArray(cartItems) ||
                    cartItems.length === 0 ||
                    cartItems.length > 50
                ) {
                    return Response.json(
                        { error: "Invalid order items." },
                        { status: 400 }
                    );
                }

                // 9. Validate each cart item
                const seenIds = new Set<string>();

                for (const item of cartItems) {
                    if (
                        !item ||
                        typeof item !== "object" ||
                        Array.isArray(item) ||
                        typeof item.product_id !== "string" ||
                        !uuidRegex.test(item.product_id) ||
                        !Number.isInteger(item.quantity) ||
                        item.quantity < 1 ||
                        item.quantity > 99 ||
                        seenIds.has(item.product_id.toLowerCase())
                    ) {
                        return Response.json(
                            { error: "Invalid product or quantity." },
                            { status: 400 }
                        );
                    }

                    seenIds.add(item.product_id.toLowerCase());
                }

                // 10. Hash helper
                async function createHash(
                    value: string
                ): Promise<string> {
                    const hashBuffer = await crypto.subtle.digest(
                        "SHA-256",
                        new TextEncoder().encode(value)
                    );

                    return Array.from(new Uint8Array(hashBuffer))
                        .map((byte) =>
                            byte.toString(16).padStart(2, "0")
                        )
                        .join("");
                }

                // 11. Create request fingerprint
                const normalizedItems = cartItems
                    .map((item) => ({
                        product_id: item.product_id.toLowerCase(),
                        quantity: item.quantity,
                    }))
                    .sort((a, b) =>
                        a.product_id.localeCompare(b.product_id)
                    );

                const requestData = JSON.stringify({
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    address,
                    language,
                    items: normalizedItems,
                });

                const requestHash = await createHash(
                    `request:${requestData}`
                );

                // 12. Check for an existing order
                const {
                    data: existingOrder,
                    error: existingOrderError,
                } = await ctx.supabaseAdmin
                    .from("orders")
                    .select("id, total, created_at, items, request_hash")
                    .eq("idempotency_key", idempotencyKey)
                    .maybeSingle();

                if (existingOrderError) {
                    throw existingOrderError;
                }

                if (existingOrder) {
                    if (existingOrder.request_hash !== requestHash) {
                        return Response.json(
                            {
                                error: "Idempotency key reused with different data.",
                            },
                            { status: 409 }
                        );
                    }

                    return Response.json({
                        success: true,
                        duplicate: true,
                        order: {
                            id: existingOrder.id,
                            total: Number(existingOrder.total),
                            created_at: existingOrder.created_at,
                            items: existingOrder.items,
                        },
                    });
                }

                // 13. Rate limiting
                const clientIp =
                    req.headers.get("cf-connecting-ip");

                // 5 requests per phone per 10 minutes
                const phoneHash = await createHash(
                    `create-order:phone:${customerPhone.replace(/\s+/g, "")}`
                );

                const {
                    data: phoneAllowed,
                    error: phoneLimitError,
                } = await ctx.supabaseAdmin.rpc(
                    "consume_order_rate_limit",
                    {
                        p_key_hash: phoneHash,
                        p_limit: 5,
                        p_window_seconds: 600,
                    }
                );

                if (phoneLimitError) {
                    console.error(
                        "Phone rate limit error:",
                        phoneLimitError
                    );

                    return Response.json(
                        {
                            error: "Order service temporarily unavailable.",
                        },
                        { status: 503 }
                    );
                }

                if (!phoneAllowed) {
                    return Response.json(
                        {
                            error: "Too many requests from this phone number.",
                        },
                        {
                            status: 429,
                            headers: {
                                "Retry-After": "600",
                            },
                        }
                    );
                }

                // 60 requests per IP per 10 minutes
                if (clientIp) {
                    const ipHash = await createHash(
                        `create-order:ip:${clientIp}`
                    );

                    const {
                        data: ipAllowed,
                        error: ipLimitError,
                    } = await ctx.supabaseAdmin.rpc(
                        "consume_order_rate_limit",
                        {
                            p_key_hash: ipHash,
                            p_limit: 60,
                            p_window_seconds: 600,
                        }
                    );

                    if (ipLimitError) {
                        console.error(
                            "IP rate limit error:",
                            ipLimitError
                        );

                        return Response.json(
                            {
                                error: "Order service temporarily unavailable.",
                            },
                            { status: 503 }
                        );
                    }

                    if (!ipAllowed) {
                        return Response.json(
                            {
                                error: "Too many requests from this network.",
                            },
                            {
                                status: 429,
                                headers: {
                                    "Retry-After": "600",
                                },
                            }
                        );
                    }
                }

                // 14. Fetch trusted product data
                const productIds = [...seenIds];

                const {
                    data: products,
                    error: productsError,
                } = await ctx.supabaseAdmin
                    .from("products")
                    .select("id, name, name_ar, price")
                    .in("id", productIds)
                    .eq("is_active", true);

                if (productsError) {
                    throw productsError;
                }

                if (
                    !products ||
                    products.length !== productIds.length
                ) {
                    return Response.json(
                        {
                            error: "One or more products are unavailable.",
                        },
                        { status: 400 }
                    );
                }

                // 15. Create product lookup map
                const productMap = new Map(
                    products.map((product) => [
                        product.id.toLowerCase(),
                        product,
                    ])
                );

                // 16. Calculate verified order total
                let totalCents = 0;

                const verifiedItems = cartItems.map((item) => {
                    const product = productMap.get(
                        item.product_id.toLowerCase()
                    );

                    if (!product) {
                        throw new Error("Invalid product.");
                    }

                    const priceCents = Math.round(
                        Number(product.price) * 100
                    );

                    if (
                        !Number.isSafeInteger(priceCents) ||
                        priceCents < 0
                    ) {
                        throw new Error(
                            "Invalid product price."
                        );
                    }

                    totalCents +=
                        priceCents * item.quantity;

                    if (!Number.isSafeInteger(totalCents)) {
                        throw new Error(
                            "Order total is too large."
                        );
                    }

                    return {
                        product_id: product.id,
                        name: product.name,
                        name_ar:
                            product.name_ar || product.name,
                        price: priceCents / 100,
                        quantity: item.quantity,
                    };
                });

                const total = totalCents / 100;

                // 17. Insert verified order
                const {
                    data: order,
                    error: orderError,
                } = await ctx.supabaseAdmin
                    .from("orders")
                    .insert({
                        idempotency_key: idempotencyKey,
                        request_hash: requestHash,
                        customer_name: customerName,
                        customer_phone: customerPhone,
                        address,
                        items: verifiedItems,
                        total,
                        language,
                        status: "pending",
                    })
                    .select("id, total, created_at, items")
                    .single();

                // Handle simultaneous duplicate requests
                if (orderError) {
                    if (orderError.code === "23505") {
                        const {
                            data: duplicateOrder,
                            error: duplicateError,
                        } = await ctx.supabaseAdmin
                            .from("orders")
                            .select("id, total, created_at, items, request_hash")
                            .eq("idempotency_key", idempotencyKey)
                            .single();

                        if (duplicateError) {
                            throw duplicateError;
                        }

                        if (duplicateOrder.request_hash !== requestHash) {
                            return Response.json(
                                {
                                    error: "Idempotency key reused with different data.",
                                },
                                { status: 409 }
                            );
                        }

                        return Response.json({
                            success: true,
                            duplicate: true,
                            order: {
                                id: duplicateOrder.id,
                                total: Number(duplicateOrder.total),
                                created_at: duplicateOrder.created_at,
                                items: duplicateOrder.items,
                            },
                        });
                    }

                    throw orderError;
                }

                // 18. Return successful response
                return Response.json({
                    success: true,
                    duplicate: false,
                    order: {
                        id: order.id,
                        total: Number(order.total),
                        created_at: order.created_at,
                        items: order.items,
                    },
                });

            } catch (error) {
                console.error(
                    "Create order error:",
                    error
                );

                return Response.json(
                    { error: "Could not create order." },
                    { status: 500 }
                );
            }
        }
    ),
};
