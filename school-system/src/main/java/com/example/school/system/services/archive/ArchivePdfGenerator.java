package com.example.school.system.services.archive;

import java.io.ByteArrayOutputStream;
import java.util.List;

import org.springframework.stereotype.Component;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@Component
public class ArchivePdfGenerator {
    public byte[] generate(String title, List<String[]> rows) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();
            document.add(new Paragraph(title));
            document.add(new Paragraph(" "));
            if (!rows.isEmpty()) {
                PdfPTable table = new PdfPTable(rows.getFirst().length);
                table.setWidthPercentage(100);
                for (String[] row : rows) {
                    for (String cell : row) {
                        table.addCell(cell == null ? "" : cell);
                    }
                }
                document.add(table);
            }
            document.close();
            return output.toByteArray();
        } catch (com.lowagie.text.DocumentException exception) {
            throw new IllegalStateException("Unable to generate archive PDF", exception);
        }
    }
}
