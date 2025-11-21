import fetch from "node-fetch";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// ====== CONFIG ======
const GOOGLE_MAPS_API_KEY = "AIzaSyDjPNhY0sSDXlEKdO1PZBgIn88LH-8eudM";

// ====== FUNCTION GET DIRECTIONS ======
export const getDirections = onRequest(
  {
    region: "us-central1",
    cors: true
  },
  async (req, res) => {
    try {
      const origin = req.query.origin;
      const destination = req.query.destination;

      if (!origin || !destination) {
        return res.status(400).json({
          status: "ERROR",
          message: "Thiếu origin hoặc destination"
        });
      }

      logger.info("getDirections called", { origin, destination });

      const url =
        "https://maps.googleapis.com/maps/api/directions/json" +
        `?origin=${encodeURIComponent(origin)}` +
        `&destination=${encodeURIComponent(destination)}` +
        "&mode=driving&region=VN&language=vi" +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        const body = await response.text();
        logger.error("Google Directions API Error", {
          status: response.status,
          body
        });
        return res.status(500).json({
          status: "ERROR",
          message: "Google Directions API failed"
        });
      }

      const data = await response.json();

      if (!data.routes || !data.routes[0]?.legs?.length) {
        logger.warn("No route returned", { googleStatus: data.status });
        return res.status(200).json({
          status: data.status || "NO_ROUTE",
          durationText: null,
          distanceText: null
        });
      }

      const leg = data.routes[0].legs[0];
      const durationText = leg.duration?.text || null;
      const distanceText = leg.distance?.text || null;

      return res.status(200).json({
        status: data.status || "OK",
        origin,
        destination,
        durationText,
        distanceText
      });
    } catch (err) {
      logger.error("getDirections exception", { error: err });
      return res.status(500).json({
        status: "ERROR",
        message: err instanceof Error ? err.message : String(err)
      });
    }
  }
);
