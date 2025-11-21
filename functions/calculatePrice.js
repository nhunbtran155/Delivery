import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

export const calculatePrice = onRequest(
  {
    region: "us-central1",
    cors: true
  },
  async (req, res) => {
    try {
      const distance = parseFloat(req.query.distance || "0");
      const weight = parseFloat(req.query.weight || "0");
      const type = (req.query.type || "normal").toLowerCase();

      if (isNaN(distance) || distance <= 0) {
        return res.status(400).json({
          status: "ERROR",
          message: "Invalid distance"
        });
      }

      // === Base Fare ===
      const baseFee = 15000;
      const perKm = 4000;

      // === Extra Fees ===
      let extraWeightFee = 0;
      if (weight > 3 && weight <= 5) extraWeightFee = 5000;
      else if (weight > 5 && weight <= 10) extraWeightFee = 10000;
      else if (weight > 10) extraWeightFee = 15000;

      let bulkyFee = 0;
      if (type === "bulky" || type === "cồng kềnh") bulkyFee = 10000;

      const total = Math.round(
        baseFee + distance * perKm + extraWeightFee + bulkyFee
      );

      logger.info("Price calculated", {
        distance,
        weight,
        type,
        total
      });

      return res.status(200).json({
        status: "OK",
        distance,
        weight,
        type,
        baseFee,
        perKm,
        extraWeightFee,
        bulkyFee,
        total,
        currency: "VND"
      });
    } catch (err) {
      logger.error("calculatePrice exception", { error: err });
      return res.status(500).json({
        status: "ERROR",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }
);
