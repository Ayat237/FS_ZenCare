export const parseCoordinatesFromFormData = (req, res, next) => {
  try {
    if (req.body.coordinates && typeof req.body.coordinates === "string") {
      req.body.coordinates = JSON.parse(req.body.coordinates);
    }
  } catch (error) {
    console.error("Invalid coordinates JSON:", error.message);
    req.body.coordinates = {}; // fallback so Joi validation fails correctly
  }
  next();
};

export const parseDoctorFormData = (req, res, next) => {
  function safeParseArray(field) {
    try {
      const value = req.body[field];
      if (!value || value === "") {
        req.body[field] = []; // empty or missing becomes empty array
        return;
      }

      if (Array.isArray(value)) return;

      const parsed = JSON.parse(value);
      req.body[field] = Array.isArray(parsed) ? parsed : [parsed]; // ensure it's always array
    } catch (e) {
      console.warn(`Failed to parse field ${field}:`, e.message);
      req.body[field] = [];
    }
  }

  // Parse fields expected to be arrays or objects
  safeParseArray("education");
  safeParseArray("certifications");
  safeParseArray("hospitalAffiliation");
  safeParseArray("role");

  next();
};
