const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Document } = require("../models");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { name, surname, email, user_id } = req.body;

    if (!name || !surname || !email || !user_id) {
      return res.status(400).json({ message: "Eksik veri gönderildi." });
    }

    // ✅ PDF oluşturma
    const doc = new PDFDocument();
    const fontPath = path.join(__dirname, "..", "fonts", "DejaVuSans.ttf");
    doc.registerFont("TurkceFont", fontPath);
    doc.font("TurkceFont");

    // ✅ Dosya adı ve kayıt yeri
    const filename = `certificate-${user_id}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "..", "uploads", filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ✅ Başlık ve Açıklama
    doc.fontSize(26).text("MentUp Katılım Sertifikası", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(14).text(
      "Bu belge, aşağıda bilgileri yer alan kişinin MentUp platformu üzerinden düzenlenen mentor-mentee görüşmesine başarıyla katıldığını onaylar.",
      {
        align: "center",
        lineGap: 4,
        width: 450,
      }
    );

    doc.moveDown(2);

    // ✅ Kullanıcı Bilgileri
    doc.fontSize(14).text(`Ad Soyad       : ${name} ${surname}`, { align: "left" });
    doc.text(`E-posta        : ${email}`, { align: "left" });
    doc.text(`Katılım Tarihi : ${new Date().toLocaleDateString("tr-TR")}`, { align: "left" });

    doc.moveDown(6); // imza alanı için boşluk bırak

    // ✅ İmza Alanı
    const pageWidth = doc.page.width;
    const margin = 72;
    const lineWidth = 150;

    const y = doc.y;
    const x1 = margin;
    const x2 = pageWidth - margin - lineWidth;

    // Çizgiler
    doc.moveTo(x1, y).lineTo(x1 + lineWidth, y).stroke();
    doc.moveTo(x2, y).lineTo(x2 + lineWidth, y).stroke();

    // ✅ Şeffaf İmza Görseli (çizgiyle yazı arasına)
    doc.image(
      path.join(__dirname, "..", "images", "signature.png"),
      x1 + 15,
      y - 30, // çizginin hemen üstü
      { width: 120 }
    );

    // İmza Yetkilisi Metni
    doc.fontSize(12).text("MentUp İmza Yetkilisi", x1, y + 5, {
      width: lineWidth,
      align: "center",
    });

    // Onay Tarihi Metni ve Tarih
    doc.fontSize(12).text("Sertifika Onay Tarihi", x2, y + 5, {
      width: lineWidth,
      align: "center",
    });

    doc.fontSize(12).text(new Date().toLocaleDateString("tr-TR"), x2, y + 20, {
      width: lineWidth,
      align: "center",
    });

    doc.end();

    // ✅ Veritabanı kaydı
    stream.on("finish", async () => {
      await Document.create({
        user_id,
        name,
        surname,
        email,
        type: "certificate",
        cv_url: `/uploads/${filename}`,
        age: 0,
        degree_number: "N/A",
        experience_years: "N/A",
        why_mentor: "N/A",
        industries: "N/A",
        skills: "N/A",
        status: "approved",
      });

      res.status(201).json({
        message: "Sertifika oluşturuldu.",
        file: `/uploads/${filename}`,
      });
    });
  } catch (err) {
    console.error("Sertifika üretim hatası:", err);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
});

module.exports = router;
