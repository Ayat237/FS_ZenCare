import * as router from "./src/modules/index.js";

console.log("Available exports:", Object.keys(router));
console.log("appointmentRouter:", typeof router.appointmentRouter);
console.log("appointmentRouter value:", router.appointmentRouter);

// Check each export
Object.keys(router).forEach((key) => {
  console.log(`${key}:`, typeof router[key]);
});
