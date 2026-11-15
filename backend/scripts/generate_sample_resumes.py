import os
import json
import fitz  # PyMuPDF
import docx

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATASET_PATH = os.path.join(PROJECT_ROOT, "data", "evaluation_dataset", "dataset.json")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "data", "test_resumes")
RESUMES_DIR = os.path.join(PROJECT_ROOT, "data", "resumes")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(RESUMES_DIR, exist_ok=True)


def generate_sample_files():
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    candidates = data.get("candidates", [])

    for idx, c in enumerate(candidates):
        safe_name = c["name"].replace(" ", "_").lower()
        resume_text = c["resume_text"]

        # Half PDF, half DOCX
        if idx % 2 == 0:
            # Generate PDF via PyMuPDF
            pdf_path = os.path.join(OUTPUT_DIR, f"{safe_name}_resume.pdf")
            doc = fitz.open()
            page = doc.new_page()
            # PyMuPDF insert_textbox
            rect = fitz.Rect(50, 50, 550, 750)
            page.insert_textbox(rect, resume_text, fontsize=11, fontname="helv")
            doc.save(pdf_path)
            doc.close()
            print(f"Generated PDF: {pdf_path}")
        else:
            # Generate DOCX via python-docx
            docx_path = os.path.join(OUTPUT_DIR, f"{safe_name}_resume.docx")
            doc = docx.Document()
            for line in resume_text.split("\n"):
                if line.strip():
                    doc.add_paragraph(line.strip())
            doc.save(docx_path)
            print(f"Generated DOCX: {docx_path}")

    # Generate one scanned / minimal PDF for OCR fallback test
    scanned_pdf_path = os.path.join(OUTPUT_DIR, "scanned_invoice_resume.pdf")
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Scanned Profile", fontsize=10)
    doc.save(scanned_pdf_path)
    doc.close()
    print(f"Generated Minimal Scanned PDF: {scanned_pdf_path}")


if __name__ == "__main__":
    generate_sample_files()
