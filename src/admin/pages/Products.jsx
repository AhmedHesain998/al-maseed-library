import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAdminLanguage } from "../context/AdminLanguageContext";
import { useAdminToast } from "../context/AdminToastContext";
import "./Products.css";

function Products() {
    const { isArabic } = useAdminLanguage();
    const { showToast } = useAdminToast();

    // =========================================
    // Default Form Data
    // =========================================

    const getInitialFormData = () => ({
        name: "",
        name_ar: "",
        price: "",
        category: "",
        stock_quantity: "0",
        low_stock_threshold: "5",
        track_inventory: true,
    });

    // =========================================
    // Products State
    // =========================================

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and filters
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Form state
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(getInitialFormData);

    // Product actions
    const [deletingId, setDeletingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Image state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // =========================================
    // Translations
    // =========================================

    const t = {
        title: isArabic ? "إدارة المنتجات" : "Products",
        subtitle: isArabic
            ? "إدارة منتجات المكتبة"
            : "Manage your library products",

        count: isArabic ? "منتج" : "Products",
        add: isArabic ? "+ إضافة منتج" : "+ Add Product",
        cancel: isArabic ? "إلغاء" : "Cancel",

        addTitle: isArabic ? "إضافة منتج جديد" : "Add New Product",
        editTitle: isArabic ? "تعديل المنتج" : "Edit Product",

        name: isArabic
            ? "اسم المنتج بالإنجليزية"
            : "Product Name (English)",
        nameAr: isArabic
            ? "اسم المنتج بالعربية"
            : "Product Name (Arabic)",
        price: isArabic ? "السعر" : "Price",
        category: isArabic ? "التصنيف" : "Category",
        image: isArabic ? "صورة المنتج" : "Product Image",

        stock: isArabic ? "الكمية المتوفرة" : "Stock Quantity",
        lowStock: isArabic ? "حد التنبيه" : "Low Stock Alert",
        trackInventory: isArabic ? "تتبع المخزون" : "Track Inventory",
        inventoryHint: isArabic
            ? "عند تفعيل التتبع، ستتم متابعة الكمية المتوفرة لهذا المنتج."
            : "When enabled, the available quantity for this product will be tracked.",
        inStock: isArabic ? "متوفر" : "In Stock",
        lowStockStatus: isArabic ? "مخزون منخفض" : "Low Stock",
        outOfStock: isArabic ? "نفد المخزون" : "Out of Stock",
        notTracked: isArabic ? "غير متابع" : "Not Tracked",

        chooseImage: isArabic
            ? "اختر صورة من جهازك"
            : "Choose an image from your device",
        imageHint: isArabic
            ? "PNG أو JPG أو WEBP — بحد أقصى 5 ميجابايت"
            : "PNG, JPG or WEBP — maximum 5 MB",
        removeImage: isArabic ? "إزالة الصورة" : "Remove image",
        currentImage: isArabic ? "الصورة الحالية" : "Current image",
        newImage: isArabic ? "الصورة الجديدة" : "New image",

        save: isArabic ? "حفظ المنتج" : "Save Product",
        update: isArabic ? "حفظ التعديلات" : "Save Changes",
        saving: isArabic ? "جاري الحفظ..." : "Saving...",

        loading: isArabic
            ? "جاري تحميل المنتجات..."
            : "Loading products...",
        loadError: isArabic
            ? "تعذر تحميل المنتجات."
            : "Unable to load products.",

        invalidPrice: isArabic
            ? "الرجاء إدخال سعر صحيح."
            : "Please enter a valid price.",
        invalidStock: isArabic
            ? "أدخل كميات صحيحة، ولا يمكن أن تكون سالبة."
            : "Enter valid non-negative stock quantities.",
        invalidImage: isArabic
            ? "اختر صورة PNG أو JPG أو WEBP بحجم لا يتجاوز 5 ميجابايت."
            : "Choose a PNG, JPG or WEBP image no larger than 5 MB.",

        noProducts: isArabic ? "لا توجد منتجات." : "No products found.",
        noMatchingProducts: isArabic
            ? "لا توجد منتجات تطابق البحث أو التصفية."
            : "No products match your search or filters.",

        search: isArabic ? "ابحث عن منتج..." : "Search products...",
        allCategories: isArabic ? "كل التصنيفات" : "All Categories",
        allStatuses: isArabic ? "كل الحالات" : "All Statuses",
        activeFilter: isArabic ? "نشط فقط" : "Active Only",
        inactiveFilter: isArabic ? "غير نشط فقط" : "Inactive Only",
        results: isArabic ? "نتيجة" : "results",

        product: isArabic ? "المنتج" : "Product",
        status: isArabic ? "الحالة" : "Status",
        active: isArabic ? "نشط" : "Active",
        inactive: isArabic ? "غير نشط" : "Inactive",
        activate: isArabic ? "تفعيل" : "Activate",
        deactivate: isArabic ? "تعطيل" : "Deactivate",
        updating: isArabic ? "جاري التحديث..." : "Updating...",
        toggleError: isArabic
            ? "تعذر تغيير حالة المنتج."
            : "Unable to update product status.",

        actions: isArabic ? "الإجراءات" : "Actions",
        edit: isArabic ? "تعديل" : "Edit",
        delete: isArabic ? "حذف" : "Delete",
        deleting: isArabic ? "جاري الحذف..." : "Deleting...",

        deleteTitle: isArabic
            ? "تأكيد حذف المنتج"
            : "Confirm Product Deletion",
        deleteMessage: isArabic
            ? "هل أنت متأكد أنك تريد حذف المنتج التالي؟"
            : "Are you sure you want to delete the following product?",
        deleteWarning: isArabic
            ? "لا يمكن التراجع عن هذه العملية بعد تأكيد الحذف."
            : "This action cannot be undone.",
        confirmDelete: isArabic
            ? "نعم، احذف المنتج"
            : "Yes, Delete Product",

        addError: isArabic
            ? "تعذرت إضافة المنتج. حاول مرة أخرى."
            : "Unable to add product. Please try again.",
        updateError: isArabic
            ? "تعذر تعديل المنتج. حاول مرة أخرى."
            : "Unable to update product. Please try again.",
        deleteError: isArabic
            ? "تعذر حذف المنتج. حاول مرة أخرى."
            : "Unable to delete product. Please try again.",
    };

    // =========================================
    // Image Helpers
    // =========================================

    function getStoragePath(imageUrl) {
        if (!imageUrl) return null;

        const marker =
            "/storage/v1/object/public/product-images/";
        const markerIndex = imageUrl.indexOf(marker);

        if (markerIndex === -1) return null;

        return decodeURIComponent(
            imageUrl
                .substring(markerIndex + marker.length)
                .split("?")[0]
        );
    }

    useEffect(() => {
        if (!imageFile) {
            setImagePreview("");
            return undefined;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    // =========================================
    // Fetch Products
    // =========================================

    async function fetchProducts() {
        try {
            setError("");

            const { data, error: fetchError } = await supabase
                .from("products")
                .select("*")
                .order("created_at", { ascending: false });

            if (fetchError) throw fetchError;

            setProducts(data || []);
        } catch (fetchError) {
            console.error("Products error:", fetchError);
            setError("load");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    // =========================================
    // Search and Filtering
    // =========================================

    const categories = [
        ...new Set(
            products
                .map((product) => product.category?.trim())
                .filter(Boolean)
        ),
    ];

    const filteredProducts = products.filter((product) => {
        const search = searchTerm.trim().toLowerCase();

        const productName = (product.name || "").toLowerCase();
        const productNameAr = (product.name_ar || "").toLowerCase();
        const productCategory = (product.category || "").toLowerCase();

        const matchesSearch =
            !search ||
            productName.includes(search) ||
            productNameAr.includes(search) ||
            productCategory.includes(search);

        const matchesCategory =
            categoryFilter === "all" ||
            product.category === categoryFilter;

        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" && product.is_active) ||
            (statusFilter === "inactive" && !product.is_active);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    // =========================================
    // Form Handlers
    // =========================================

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function resetForm() {
        setFormData(getInitialFormData());
        setImageFile(null);
        setEditingProduct(null);
        setFormError("");
        setShowForm(false);

        const input = document.getElementById("product-image");
        if (input) input.value = "";
    }

    function handleImageChange(event) {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (
            !allowedTypes.includes(file.type) ||
            file.size > 5 * 1024 * 1024
        ) {
            setFormError(t.invalidImage);
            event.target.value = "";
            setImageFile(null);
            return;
        }

        setFormError("");
        setImageFile(file);
    }

    function handleEditProduct(product) {
        setEditingProduct(product);

        setFormData({
            name: product.name || "",
            name_ar: product.name_ar || "",
            price: String(product.price ?? ""),
            category: product.category || "",
            stock_quantity: String(product.stock_quantity ?? 0),
            low_stock_threshold: String(
                product.low_stock_threshold ?? 5
            ),
            track_inventory: product.track_inventory ?? true,
        });

        setImageFile(null);
        setFormError("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function handleOpenAddForm() {
        if (showForm) {
            resetForm();
            return;
        }

        setEditingProduct(null);
        setFormData(getInitialFormData());
        setImageFile(null);
        setFormError("");
        setShowForm(true);
    }

    // =========================================
    // Add and Update Product
    // =========================================

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError("");

        const price = Number(formData.price);
        const stockQuantity = Number(formData.stock_quantity);
        const lowStockThreshold = Number(
            formData.low_stock_threshold
        );

        if (
            !Number.isFinite(price) ||
            price < 0 ||
            formData.price.trim() === ""
        ) {
            setFormError(t.invalidPrice);
            return;
        }

        if (
            !Number.isInteger(stockQuantity) ||
            stockQuantity < 0 ||
            formData.stock_quantity.trim() === "" ||
            !Number.isInteger(lowStockThreshold) ||
            lowStockThreshold < 0 ||
            formData.low_stock_threshold.trim() === ""
        ) {
            setFormError(t.invalidStock);
            return;
        }

        if (
            !formData.name.trim() ||
            !formData.name_ar.trim() ||
            !formData.category.trim()
        ) {
            return;
        }

        const wasEditing = Boolean(editingProduct);

        setSaving(true);

        let uploadedImagePath = null;

        try {
            let imageUrl = editingProduct?.image || null;

            // Upload a new image if selected.
            if (imageFile) {
                const fileExtension = imageFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();

                uploadedImagePath =
                    `${crypto.randomUUID()}.${fileExtension}`;

                const { error: uploadError } = await supabase.storage
                    .from("product-images")
                    .upload(uploadedImagePath, imageFile, {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: imageFile.type,
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(uploadedImagePath);

                imageUrl = publicUrlData.publicUrl;
            }

            const productData = {
                name: formData.name.trim(),
                name_ar: formData.name_ar.trim(),
                price,
                category: formData.category.trim(),
                image: imageUrl,
                stock_quantity: stockQuantity,
                low_stock_threshold: lowStockThreshold,
                track_inventory: formData.track_inventory,
            };

            if (wasEditing) {
                const { error: updateError } = await supabase
                    .from("products")
                    .update(productData)
                    .eq("id", editingProduct.id);

                if (updateError) throw updateError;

                // Remove the old image only after a successful update.
                if (uploadedImagePath && editingProduct.image) {
                    const oldImagePath = getStoragePath(
                        editingProduct.image
                    );

                    if (oldImagePath) {
                        const { error: removeError } =
                            await supabase.storage
                                .from("product-images")
                                .remove([oldImagePath]);

                        if (removeError) {
                            console.error(
                                "Old image cleanup error:",
                                removeError
                            );
                        }
                    }
                }
            } else {
                const { error: insertError } = await supabase
                    .from("products")
                    .insert({
                        ...productData,
                        is_active: true,
                    });

                if (insertError) throw insertError;
            }

            resetForm();
            await fetchProducts();

            showToast(
                "success",
                wasEditing
                    ? isArabic
                        ? "تم تعديل المنتج بنجاح."
                        : "Product updated successfully."
                    : isArabic
                        ? "تمت إضافة المنتج بنجاح."
                        : "Product added successfully."
            );
        } catch (saveError) {
            console.error("Save product error:", saveError);

            // Clean up the newly uploaded image if saving failed.
            if (uploadedImagePath) {
                const { error: removeError } = await supabase.storage
                    .from("product-images")
                    .remove([uploadedImagePath]);

                if (removeError) {
                    console.error(
                        "Image cleanup error:",
                        removeError
                    );
                }
            }

            showToast(
                "error",
                `${wasEditing ? t.updateError : t.addError}${
                    saveError.message ? ` (${saveError.message})` : ""
                }`
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================================
    // Activate and Deactivate Product
    // =========================================

    async function handleToggleProduct(product) {
        const newStatus = !product.is_active;
        const action = newStatus ? t.activate : t.deactivate;

        const confirmed = window.confirm(
            isArabic
                ? `هل أنت متأكد من ${action} المنتج "${product.name_ar}"؟`
                : `Are you sure you want to ${action.toLowerCase()} "${product.name}"?`
        );

        if (!confirmed) return;

        setUpdatingId(product.id);

        try {
            const { error: updateError } = await supabase
                .from("products")
                .update({ is_active: newStatus })
                .eq("id", product.id);

            if (updateError) throw updateError;

            setProducts((previous) =>
                previous.map((item) =>
                    item.id === product.id
                        ? { ...item, is_active: newStatus }
                        : item
                )
            );

            showToast(
                "success",
                isArabic
                    ? `تم ${newStatus ? "تفعيل" : "تعطيل"} المنتج بنجاح.`
                    : `Product ${
                        newStatus ? "activated" : "deactivated"
                    } successfully.`
            );
        } catch (toggleError) {
            console.error("Toggle product error:", toggleError);

            showToast(
                "error",
                `${t.toggleError}${
                    toggleError.message
                        ? ` (${toggleError.message})`
                        : ""
                }`
            );
        } finally {
            setUpdatingId(null);
        }
    }

    // =========================================
    // Delete Product
    // =========================================

    function handleDeleteProduct(product) {
        setDeleteTarget(product);
    }

    async function confirmDeleteProduct() {
        if (!deleteTarget) return;

        const product = deleteTarget;
        setDeletingId(product.id);

        try {
            const { error: deleteError } = await supabase
                .from("products")
                .delete()
                .eq("id", product.id);

            if (deleteError) throw deleteError;

            const imagePath = getStoragePath(product.image);

            if (imagePath) {
                const { error: imageError } = await supabase.storage
                    .from("product-images")
                    .remove([imagePath]);

                if (imageError) {
                    console.error(
                        "Product image deletion error:",
                        imageError
                    );
                }
            }

            setProducts((previous) =>
                previous.filter((item) => item.id !== product.id)
            );

            setDeleteTarget(null);

            showToast(
                "success",
                isArabic
                    ? "تم حذف المنتج بنجاح."
                    : "Product deleted successfully."
            );
        } catch (deleteError) {
            console.error("Delete product error:", deleteError);

            showToast(
                "error",
                `${t.deleteError}${
                    deleteError.message
                        ? ` (${deleteError.message})`
                        : ""
                }`
            );
        } finally {
            setDeletingId(null);
        }
    }

    // =========================================
    // Stock Status Helper
    // =========================================

    function getStockStatus(product) {
        if (!product.track_inventory) {
            return {
                className: "not-tracked",
                label: t.notTracked,
            };
        }

        const quantity = Number(product.stock_quantity ?? 0);
        const threshold = Number(
            product.low_stock_threshold ?? 5
        );

        if (quantity <= 0) {
            return {
                className: "out-of-stock",
                label: t.outOfStock,
            };
        }

        if (quantity <= threshold) {
            return {
                className: "low-stock",
                label: `${quantity} - ${t.lowStockStatus}`,
            };
        }

        return {
            className: "in-stock",
            label: `${quantity} - ${t.inStock}`,
        };
    }

    // =========================================
    // Loading and Error States
    // =========================================

    if (loading) {
        return <p>{t.loading}</p>;
    }

    if (error) {
        return <p role="alert">{t.loadError}</p>;
    }

    // =========================================
    // Products Page UI
    // =========================================

    return (
        <div
            className="products-page"
            dir={isArabic ? "rtl" : "ltr"}
        >
            {/* Products Header */}
            <div className="products-header">
                <div>
                    <h1>{t.title}</h1>
                    <p>{t.subtitle}</p>
                </div>

                <div className="products-header-actions">
                    <span className="products-count">
                        {products.length} {t.count}
                    </span>

                    <button
                        className="add-product-btn"
                        type="button"
                        onClick={handleOpenAddForm}
                    >
                        {showForm ? t.cancel : t.add}
                    </button>
                </div>
            </div>

            {/* Add and Edit Product Form */}
            {showForm && (
                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >
                    <h2>
                        {editingProduct ? t.editTitle : t.addTitle}
                    </h2>

                    <div className="product-form-grid">
                        <label>
                            {t.name}
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            {t.nameAr}
                            <input
                                type="text"
                                name="name_ar"
                                value={formData.name_ar}
                                onChange={handleChange}
                                dir="rtl"
                                required
                            />
                        </label>

                        <label>
                            {t.price}
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                            />
                        </label>

                        <label>
                            {t.category}
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        {/* Inventory Fields */}
                        <label>
                            {t.stock}
                            <input
                                type="number"
                                name="stock_quantity"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                min="0"
                                step="1"
                                required
                            />
                        </label>

                        <label>
                            {t.lowStock}
                            <input
                                type="number"
                                name="low_stock_threshold"
                                value={formData.low_stock_threshold}
                                onChange={handleChange}
                                min="0"
                                step="1"
                                required
                            />
                        </label>

                        <label className="inventory-toggle">
                            <input
                                type="checkbox"
                                name="track_inventory"
                                checked={formData.track_inventory}
                                onChange={(event) =>
                                    setFormData((previous) => ({
                                        ...previous,
                                        track_inventory:
                                            event.target.checked,
                                    }))
                                }
                            />
                            <span>{t.trackInventory}</span>
                            <small>{t.inventoryHint}</small>
                        </label>

                        {/* Product Image Upload */}
                        <div className="product-image-field">
                            <label htmlFor="product-image">
                                {t.image}
                            </label>

                            <label
                                className="image-upload-control"
                                htmlFor="product-image"
                            >
                                <span>{t.chooseImage}</span>
                                <input
                                    id="product-image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageChange}
                                />
                            </label>

                            <small>{t.imageHint}</small>

                            {editingProduct?.image && !imagePreview && (
                                <div className="image-preview">
                                    <img
                                        src={editingProduct.image}
                                        alt={t.currentImage}
                                    />
                                    <span>{t.currentImage}</span>
                                </div>
                            )}

                            {imagePreview && (
                                <div className="image-preview">
                                    <img
                                        src={imagePreview}
                                        alt={t.newImage}
                                    />
                                    <span>{t.newImage}</span>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setFormError("");

                                            const input =
                                                document.getElementById(
                                                    "product-image"
                                                );

                                            if (input) input.value = "";
                                        }}
                                    >
                                        {t.removeImage}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {formError && (
                        <p
                            className="product-form-error"
                            role="alert"
                        >
                            {formError}
                        </p>
                    )}

                    <div className="product-form-actions">
                        <button
                            type="submit"
                            className="save-product-btn"
                            disabled={saving}
                        >
                            {saving
                                ? t.saving
                                : editingProduct
                                    ? t.update
                                    : t.save}
                        </button>

                        <button
                            type="button"
                            className="cancel-product-btn"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            {t.cancel}
                        </button>
                    </div>
                </form>
            )}

            {/* Products Search and Filters */}
            <div className="products-filters">
                <div className="products-search">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder={t.search}
                        aria-label={t.search}
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={(event) =>
                        setCategoryFilter(event.target.value)
                    }
                    aria-label={t.category}
                >
                    <option value="all">{t.allCategories}</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                    aria-label={t.status}
                >
                    <option value="all">{t.allStatuses}</option>
                    <option value="active">{t.activeFilter}</option>
                    <option value="inactive">{t.inactiveFilter}</option>
                </select>

                <span className="products-results-count">
                    {filteredProducts.length} {t.results}
                </span>
            </div>

            {/* Products Table */}
            <div className="products-table-wrapper">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>{t.product}</th>
                            <th>{t.category}</th>
                            <th>{t.price}</th>
                            <th>{t.stock}</th>
                            <th>{t.status}</th>
                            <th>{t.actions}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product);

                            return (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-info">
                                            {product.image && (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                />
                                            )}

                                            <span>
                                                {isArabic
                                                    ? product.name_ar
                                                    : product.name}
                                            </span>
                                        </div>
                                    </td>

                                    <td>{product.category}</td>
                                    <td>{product.price}</td>

                                    <td>
                                        <span
                                            className={`stock-status ${stockStatus.className}`}
                                        >
                                            {stockStatus.label}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={
                                                product.is_active
                                                    ? "product-status active"
                                                    : "product-status inactive"
                                            }
                                        >
                                            {product.is_active
                                                ? t.active
                                                : t.inactive}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="product-actions">
                                            <button
                                                type="button"
                                                className={
                                                    product.is_active
                                                        ? "deactivate-product-btn"
                                                        : "activate-product-btn"
                                                }
                                                onClick={() =>
                                                    handleToggleProduct(product)
                                                }
                                                disabled={
                                                    updatingId !== null ||
                                                    deletingId !== null ||
                                                    saving
                                                }
                                            >
                                                {updatingId === product.id
                                                    ? t.updating
                                                    : product.is_active
                                                        ? t.deactivate
                                                        : t.activate}
                                            </button>

                                            <button
                                                type="button"
                                                className="edit-product-btn"
                                                onClick={() =>
                                                    handleEditProduct(product)
                                                }
                                                disabled={
                                                    saving ||
                                                    deletingId !== null ||
                                                    updatingId !== null
                                                }
                                            >
                                                {t.edit}
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-product-btn"
                                                onClick={() =>
                                                    handleDeleteProduct(product)
                                                }
                                                disabled={
                                                    deletingId !== null ||
                                                    updatingId !== null ||
                                                    saving
                                                }
                                            >
                                                {deletingId === product.id
                                                    ? t.deleting
                                                    : t.delete}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Empty States */}
                {filteredProducts.length === 0 && (
                    <p className="empty-products">
                        {products.length === 0
                            ? t.noProducts
                            : t.noMatchingProducts}
                    </p>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div
                    className="delete-modal-overlay"
                    onClick={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deletingId
                        ) {
                            setDeleteTarget(null);
                        }
                    }}
                >
                    <div
                        className="delete-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-modal-title"
                        dir={isArabic ? "rtl" : "ltr"}
                    >
                        <div className="delete-modal-icon">
                            <span>!</span>
                        </div>

                        <h2 id="delete-modal-title">
                            {t.deleteTitle}
                        </h2>

                        <p className="delete-modal-message">
                            {t.deleteMessage}
                        </p>

                        <div className="delete-modal-product">
                            {deleteTarget.image && (
                                <img
                                    src={deleteTarget.image}
                                    alt={deleteTarget.name}
                                />
                            )}

                            <strong>
                                {isArabic
                                    ? deleteTarget.name_ar
                                    : deleteTarget.name}
                            </strong>
                        </div>

                        <p className="delete-modal-warning">
                            {t.deleteWarning}
                        </p>

                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="confirm-delete-btn"
                                onClick={confirmDeleteProduct}
                                disabled={deletingId !== null}
                            >
                                {deletingId === deleteTarget.id
                                    ? t.deleting
                                    : t.confirmDelete}
                            </button>

                            <button
                                type="button"
                                className="cancel-delete-btn"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deletingId !== null}
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Products;
