const str = "{\"deliveryChallan\":\"http://127.0.0.1:5000/uploads/1781007953538-Financial_Report_2022-10-29_to_2026-05-29.pdf\",\"ewayBill\":\"http://127.0.0.1:5000/uploads/1781007953550-Tenders_Report_2024-01-28_to_2026-05-01.pdf\",\"invoice\":\"http://127.0.0.1:5000/uploads/1781007953559-Financial_Report_2022-10-29_to_2026-05-29.pdf\",\"installationChallan\":\"http://127.0.0.1:5000/uploads/1781007953566-Tenders_Report_2024-01-28_to_2026-05-01.pdf\",\"noc\":\"http://127.0.0.1:5000/uploads/1781007953576-Tenders_Report_2024-01-28_to_2026-05-01.pdf\"}";
let parsed;
try {
  parsed = JSON.parse(str);
  console.log("Parsed keys:", Object.keys(parsed));
  console.log("deliveryChallan:", parsed.deliveryChallan);
} catch (e) {
  console.log("Error:", e.message);
}
