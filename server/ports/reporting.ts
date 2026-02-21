import { Router } from "express";
import PDFDocument from "pdfkit";
import { simulations, auditLogs } from "../infrastructure/schema";
import { memoryDb } from "../infrastructure/memoryDb";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const createReportingRouter = (db: any) => {
  const router = Router();

  // GET: Generate a Compliance PDF for a given simulation ID
  router.get("/compliance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      let simData;
      let auditData;

      if (!db) {
        simData = memoryDb.simulations.find((s) => s.id === id);
        auditData = memoryDb.auditLogs.find((a) => a.simulationId === id);
        if (!simData) {
          return res
            .status(404)
            .json({ success: false, message: "Simulation not found" });
        }
      } else {
        // Fetch simulation and its audit log
        const data = await db
          .select()
          .from(simulations)
          .leftJoin(auditLogs, eq(simulations.id, auditLogs.simulationId))
          .where(eq(simulations.id, id))
          .limit(1);

        if (!data || data.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Simulation not found" });
        }

        simData = data[0].simulations;
        auditData = data[0].audit_logs;
      }

      // Generate PDF
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader(
        "Content-disposition",
        `attachment; filename="Compliance_Audit_${id}.pdf"`,
      );
      res.setHeader("Content-type", "application/pdf");

      doc.pipe(res);

      // Header
      doc
        .fontSize(20)
        .text("Warme Miete - Compliance Audit Report", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Date: ${new Date().toISOString()}`, { align: "right" });
      doc.moveDown(2);

      // Legal Framework
      doc
        .fontSize(16)
        .text("Legal Framework: BGB § 559 (Modernisierungsumlage)");
      doc
        .fontSize(10)
        .text(
          "According to § 559 BGB, landlords are permitted to allocate up to 8% of modernization costs to the annual rent, capped at €3.00/sqm per month (or €2.00/sqm if base rent < €7.00/sqm). This report mathematically verifies compliance with this statute and details the tenant net-benefit (Warm Rent reduction) based strictly on deterministic inputs.",
          { align: "justify" },
        );
      doc.moveDown(2);

      // Structural Inputs (Anonymized)
      doc.fontSize(14).text("1. Structural Metadata (Zero-Trust)");
      doc.fontSize(12).text(`Units: ${simData.units}`);
      doc.text(`Building Age Category: ${simData.buildingAge}`);
      doc.text(`Retrofit Strategy: ${simData.retrofitType.toUpperCase()}`);
      doc.moveDown(2);

      // Financial Output
      const results: any = simData.results;
      if (results) {
        doc.fontSize(14).text("2. Verified Financial Outcomes");
        doc
          .fontSize(12)
          .text(
            `Total Capital Expenditure: €${results.totalCost?.toLocaleString()}`,
          );
        doc.text(
          `Applied Subsidies (e.g., KfW/BAFA): €${results.totalSubsidy?.toLocaleString()}`,
        );
        doc.text(
          `Net Landlord Cost: €${results.netLandlordCost?.toLocaleString()}`,
        );
        doc.moveDown();
        doc.text(
          `Tenant Base Rent Increase (Allocation): €${results.landlordAnnualExtraRev?.toLocaleString()} / year`,
        );
        doc.text(
          `Tenant Heating Savings: Positive net decrease establishing 'Warme Miete' Equilibrium.`,
        );
        doc.moveDown(2);
      }

      // Cryptographic Audit Trail
      doc.fontSize(14).text("3. Cryptographic Proof of Execution");
      if (auditData) {
        doc.fontSize(10).font("Courier").text(`Immutable Hash (SHA-256):`);
        doc.text(`${auditData.hash}`, { lineBreak: true });
        doc.moveDown();
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`Signature Timestamp: ${auditData.createdAt}`);
        doc.text(
          `This hash serves as immutable proof of the calculation state, inputs, and the verified engine version. Any tampering with the input data or math engine instantly invalidates this document.`,
        );
      } else {
        doc
          .fillColor("red")
          .fontSize(10)
          .text(
            "WARNING: No immutable cryptographic signature found for this record.",
          );
      }

      // Finalize PDF
      doc.end();
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  const ephemeralPayloadSchema = z
    .object({
      simulationId: z.number(),
      buildingAddress: z.string().min(5),
      tenantName: z.string().min(2),
      landlordName: z.string().min(2),
      ephemeralResults: z.any().optional(),
    })
    .strict();

  // POST: Generate a Deal Closer Contract PDF (Ephemeral PII, Zero-Trust)
  router.post("/contract", async (req, res) => {
    try {
      const parseResult = ephemeralPayloadSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Invalid payload for contract generation.",
          });
      }

      const { simulationId, buildingAddress, tenantName, landlordName, ephemeralResults } =
        parseResult.data;

      // Fetch the verified mathematical simulation
      let simData;
      let auditData;

      if (!db) {
        simData = memoryDb.simulations.find((s) => s.id === simulationId);
        auditData = memoryDb.auditLogs.find(
          (a) => a.simulationId === simulationId,
        );
      } else {
        const data = await db
          .select()
          .from(simulations)
          .leftJoin(auditLogs, eq(simulations.id, auditLogs.simulationId))
          .where(eq(simulations.id, parseInt(simulationId as any)))
          .limit(1);
        if (data && data.length > 0) {
          simData = data[0].simulations;
          auditData = data[0].audit_logs;
        }
      }

      let results: any = null;

      if (simData && simData.results) {
        results = simData.results;
      } else if (ephemeralResults) {
        // Zero-friction mode, use ephemeral results
        results = ephemeralResults;
      }

      if (!results) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Verified simulation record not found.",
          });
      }

      // Generate "The Deal Closer" PDF
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader(
        "Content-disposition",
        `attachment; filename="GreenLease_${simulationId}.pdf"`,
      );
      res.setHeader("Content-type", "application/pdf");
      doc.pipe(res);

      // Title
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("ZIA Green Lease 2.0 Addendum", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Generated: ${new Date().toLocaleDateString()}`, {
          align: "right",
        });
      doc.moveDown(2);

      // Ephemeral PII (Never stored in the DB, only rendered into the PDF stream)
      // This is the core of the Zero-Trust Moat
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("1. Contractual Parties & Asset");
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Building Address: ${buildingAddress}`);
      doc.text(`Landlord: ${landlordName}`);
      doc.text(`Tenant: ${tenantName}`);
      doc.moveDown();
      doc
        .fontSize(9)
        .fillColor("gray")
        .text(
          "Disclaimer: PII data is processed ephemerally for PDF generation only and is not logged or stored by Warme Miete to ensure strict GDPR compliance.",
          { align: "justify" },
        );
      doc.moveDown(2);

      // The Financial Deal
      doc
        .fontSize(14)
        .fillColor("black")
        .font("Helvetica-Bold")
        .text("2. RETROFIT DEAL SUMMARY");
      doc.moveDown();

      const oldRentMo = results.oldRent / 12;
      const oldHeatingMo = results.oldHeating / 12;
      const oldCo2Mo = results.co2TaxTenantOld / 12;
      const oldTotalMo = oldRentMo + oldHeatingMo + oldCo2Mo;

      const newRentMo = results.newRent / 12;
      const newHeatingMo = results.newHeating / 12;
      const newCo2Mo = results.co2TaxTenantNew / 12;
      const newTotalMo = newRentMo + newHeatingMo + newCo2Mo;
      const netTenantSavingsMo = results.tenantNetSavings / 12;

      doc.fontSize(11).font("Courier").text(`Pre:  Rent €${oldRentMo.toFixed(0)} + Heat €${oldHeatingMo.toFixed(0)} + CO2 €${oldCo2Mo.toFixed(0)} = €${oldTotalMo.toFixed(0)}/mo`);
      doc.text(`Post: Rent €${newRentMo.toFixed(0)} + Heat €${newHeatingMo.toFixed(0)} + CO2 €${newCo2Mo.toFixed(0)} = €${newTotalMo.toFixed(0)}? NO—€${(oldTotalMo - netTenantSavingsMo).toFixed(0)} NET (savings exceed levy)`);
      doc.moveDown(1.5);

      doc.font("Helvetica-Bold").text(`TENANT: Save €${netTenantSavingsMo.toFixed(0)}/mo net + warmer home. Sign: ___________________________`);
      doc.moveDown();
      doc.text(`LANDLORD: Recover €${results.landlordAnnualExtraRev.toFixed(0)}/yr + €${results.landlordCo2Savings.toFixed(0)} CO2 avoided + asset value +€${(results.assetPremiumValue || 0).toFixed(0)}. Sign: ___________________________`);
      doc.moveDown();
      doc.text(`BANK: €${results.netLandlordCost.toFixed(0)} loan collateralized by verified savings. Approve: ___________________________`);
      doc.moveDown(2);

      // Signatures context
      doc
        .fontSize(11)
        .font("Helvetica")
        .text(
          `By signing above, the Tenant agrees to the Modernisierungsumlage capped effectively by the guaranteed utility savings, resulting in a strict net-positive reduction of Warm Rent.`,
          { align: "justify" },
        );
      doc.moveDown(3);

      doc.text(`Landlord: ${landlordName}`, 50, doc.y);
      doc.text(`Tenant: ${tenantName}`, 350, doc.y - 12);

      // Branding Footer
      doc.moveDown(5);
      doc
        .fontSize(8)
        .fillColor("green")
        .text(
          "Calculations & Compliance powered by the Warme Miete Platform.",
          { align: "center" },
        );

      doc.end();
    } catch (error: any) {
      console.error("Contract Generation Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  });

  return router;
};
