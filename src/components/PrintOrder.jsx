
import { useState } from "react";

function PrintOrder({ language }) {
  const [file, setFile] = useState(null);
  const [printType, setPrintType] = useState("black");
  const [copies, setCopies] = useState(1);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paperSize, setPaperSize] = useState("A4");
  const [printSide, setPrintSide] = useState("single");
  const [notes, setNotes] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const isArabic = language === "ar";

  // اختيار الملف والتحقق من نوعه وحجمه
  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    const allowedTypes = [".pdf", ".doc", ".docx"];

    const extension = selectedFile.name
      .slice(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedTypes.includes(extension)) {
      setError(
        isArabic
          ? "الرجاء اختيار ملف PDF أو Word فقط."
          : "Please select a PDF or Word file."
      );

      setFile(null);
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError(
        isArabic
          ? "حجم الملف يجب ألا يتجاوز 15 ميجابايت."
          : "File size must not exceed 15 MB."
      );

      setFile(null);
      event.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);
    setShowPreview(false);
  }

  // مراجعة الطلب فقط، بدون فتح واتساب
  function handleSubmit(event) {
    event.preventDefault();

    if (!customerName.trim() || !phone.trim()) {
      setError(
        isArabic
          ? "الرجاء إدخال الاسم ورقم الهاتف."
          : "Please enter your name and phone number."
      );
      return;
    }

    if (!file) {
      setError(
        isArabic
          ? "الرجاء اختيار ملف أولاً."
          : "Please select a file first."
      );
      return;
    }

    setError("");
    setShowPreview(true);
  }

  // تأكيد الطلب وفتح واتساب
  function confirmOrder() {
    if (!file) return;

    const whatsappNumber = "249928658885";

    const typeName =
      printType === "black"
        ? isArabic
          ? "أبيض وأسود"
          : "Black & White"
        : isArabic
          ? "ملون"
          : "Color";

    const sideName =
      printSide === "single"
        ? isArabic
          ? "وجه واحد"
          : "Single-sided"
        : isArabic
          ? "وجهين"
          : "Double-sided";

    const message = isArabic
      ? `السلام عليكم، أريد طلب طباعة:

اسم الزبون: ${customerName}
رقم الهاتف: ${phone}
اسم الملف: ${file.name}
نوع الطباعة: ${typeName}
عدد النسخ: ${copies}
حجم الورق: ${paperSize}
الطباعة: ${sideName}
ملاحظات: ${notes || "لا توجد"}

سأرفق الملف في المحادثة.`
      : `Hello, I would like to request printing:

Customer: ${customerName}
Phone: ${phone}
File: ${file.name}
Print type: ${typeName}
Copies: ${copies}
Paper size: ${paperSize}
Sides: ${sideName}
Notes: ${notes || "None"}

I will attach the file in the chat.`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  }

  return (
    <section className="print-order-section" id="print-order">
      <div className="print-order-container">

        <div className="print-order-heading">
          <span>
            {isArabic ? "اطلب الآن" : "Place Your Order"}
          </span>

          <h2>
            {isArabic
              ? "أرسل ملفك للطباعة"
              : "Send Your File for Printing"}
          </h2>

          <p>
            {isArabic
              ? "اختر الملف وحدد تفاصيل الطباعة وسنتواصل معك."
              : "Choose your file and printing details. We will contact you."}
          </p>
        </div>

        {/* بيانات الزبون — لازم نعرف صاحب الطلب 😄 */}
        <form className="print-order-form" onSubmit={handleSubmit}>

          <label htmlFor="customer-name">
            {isArabic ? "اسم الزبون" : "Customer Name"}
          </label>

          <input
            id="customer-name"
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder={isArabic ? "أدخل اسمك" : "Enter your name"}
            required
          />

          <label htmlFor="customer-phone">
            {isArabic ? "رقم الهاتف" : "Phone Number"}
          </label>

          <input
            id="customer-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="09XXXXXXXX"
            required
          />

          {/* اختيار الملف — الطابعة جاهزة */}
          <label htmlFor="print-file">
            {isArabic
              ? "اختر ملف PDF أو Word"
              : "Choose PDF or Word File"}
          </label>

          <input
            id="print-file"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />

          {file && (
            <p className="selected-file">📎 {file.name}</p>
          )}

          {error && (
            <p className="file-error">{error}</p>
          )}

          {/* إعدادات الطباعة */}
          <label htmlFor="print-type">
            {isArabic ? "لون الطباعة" : "Printing Type"}
          </label>

          <select
            id="print-type"
            value={printType}
            onChange={(event) => setPrintType(event.target.value)}
          >
            <option value="black">
              {isArabic ? "أبيض وأسود" : "Black & White"}
            </option>

            <option value="color">
              {isArabic ? "ملون" : "Color"}
            </option>
          </select>

          <label htmlFor="copies">
            {isArabic ? "عدد النسخ" : "Number of Copies"}
          </label>

          <input
            id="copies"
            type="number"
            min="1"
            max="100"
            value={copies}
            onChange={(event) =>
              setCopies(
                Math.max(1, Math.min(100, Number(event.target.value) || 1))
              )
            }
          />

          <label htmlFor="paper-size">
            {isArabic ? "حجم الورق" : "Paper Size"}
          </label>

          <select
            id="paper-size"
            value={paperSize}
            onChange={(event) => setPaperSize(event.target.value)}
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>

          <label htmlFor="print-side">
            {isArabic ? "وجوه الطباعة" : "Print Sides"}
          </label>

          <select
            id="print-side"
            value={printSide}
            onChange={(event) => setPrintSide(event.target.value)}
          >
            <option value="single">
              {isArabic ? "وجه واحد" : "Single-sided"}
            </option>

            <option value="double">
              {isArabic ? "وجهين" : "Double-sided"}
            </option>
          </select>

          {/* الملاحظات — أي طلبات خاصة */}
          <label htmlFor="print-notes">
            {isArabic ? "ملاحظات إضافية" : "Additional Notes"}
          </label>

          <textarea
            id="print-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={
              isArabic
                ? "مثلاً: تدبيس، ألوان معينة..."
                : "e.g. Stapling, specific colors..."
            }
          />

          <button type="submit">
            {isArabic ? "مراجعة الطلب" : "Review Order"}
          </button>
        </form>

        {/* معاينة الطلب — قبل الإرسال النهائي */}
        {showPreview && (
          <div className="order-preview">

            <h2>
              {isArabic ? "مراجعة طلبك" : "Review Your Order"}
            </h2>

            <div className="preview-details">

              <p>
                <strong>{isArabic ? "الاسم:" : "Name:"}</strong>{" "}
                {customerName}
              </p>

              <p>
                <strong>{isArabic ? "الهاتف:" : "Phone:"}</strong>{" "}
                {phone}
              </p>

              <p>
                <strong>{isArabic ? "الملف:" : "File:"}</strong>{" "}
                {file?.name}
              </p>

              <p>
                <strong>
                  {isArabic ? "نوع الطباعة:" : "Print Type:"}
                </strong>{" "}
                {printType === "black"
                  ? isArabic
                    ? "أبيض وأسود"
                    : "Black & White"
                  : isArabic
                    ? "ملون"
                    : "Color"}
              </p>

              <p>
                <strong>{isArabic ? "عدد النسخ:" : "Copies:"}</strong>{" "}
                {copies}
              </p>

              <p>
                <strong>
                  {isArabic ? "حجم الورق:" : "Paper Size:"}
                </strong>{" "}
                {paperSize}
              </p>

              <p>
                <strong>{isArabic ? "الطباعة:" : "Sides:"}</strong>{" "}
                {printSide === "single"
                  ? isArabic
                    ? "وجه واحد"
                    : "Single-sided"
                  : isArabic
                    ? "وجهين"
                    : "Double-sided"}
              </p>

              <p>
                <strong>{isArabic ? "ملاحظات:" : "Notes:"}</strong>{" "}
                {notes || (isArabic ? "لا توجد" : "None")}
              </p>

            </div>

            <div className="preview-actions">

              <button type="button" onClick={confirmOrder}>
                {isArabic
                  ? "تأكيد وإرسال عبر واتساب"
                  : "Confirm & Send via WhatsApp"}
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
              >
                {isArabic ? "رجوع للتعديل" : "Back to Edit"}
              </button>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default PrintOrder;
