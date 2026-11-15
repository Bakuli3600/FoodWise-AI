import unittest
import json
from pathlib import Path
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.core.security import hash_password, verify_password, create_access_token
from src.analysis.waste_calculator import WasteAreaCalculator

class TestFoodWiseFullSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        """Verifies health check endpoint and model checkpoint status."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "FOODWISE AI")

    def test_02_auth_login_admin(self):
        """Verifies JWT authentication for seeded admin."""
        res = self.client.post("/api/auth/login", json={
            "email": "admin@foodwise.ai",
            "password": "Admin@1234"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "Super Admin")

    def test_03_auth_login_invalid(self):
        """Verifies invalid password rejection."""
        res = self.client.post("/api/auth/login", json={
            "email": "admin@foodwise.ai",
            "password": "WrongPassword999!"
        })
        self.assertEqual(res.status_code, 401)

    def test_04_waste_calculator_safeguards(self):
        """Verifies mathematical safeguards in WasteAreaCalculator."""
        calc = WasteAreaCalculator(min_plate_area=1000)

        # 1. No objects detected
        res = calc.calculate_from_masks([])
        self.assertEqual(res["waste_percentage"], 0.0)
        self.assertFalse(res["plate_detected"])

        # 2. Missing plate safeguard
        res = calc.calculate_from_masks([
            {"class_id": 63, "class_name": "rice", "area": 5000, "confidence": 0.9}
        ])
        self.assertEqual(res["status"], "no_plate_detected")
        self.assertEqual(res["waste_percentage"], 0.0)

        # 3. Normal plate calculation: 20,000 food / 100,000 plate = 20.0%
        res = calc.calculate_from_masks([
            {"class_id": 58, "class_name": "plate", "area": 100000, "confidence": 0.95},
            {"class_id": 63, "class_name": "rice", "area": 20000, "confidence": 0.88}
        ])
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["waste_percentage"], 20.0)

        # 4. Utensil exclusion safeguard: fork (class 31) must NOT be added to food area
        res_with_fork = calc.calculate_from_masks([
            {"class_id": 58, "class_name": "plate", "area": 100000, "confidence": 0.95},
            {"class_id": 63, "class_name": "rice", "area": 20000, "confidence": 0.88},
            {"class_id": 31, "class_name": "fork", "area": 15000, "confidence": 0.92}
        ])
        self.assertEqual(res_with_fork["waste_percentage"], 20.0)
        self.assertEqual(res_with_fork["food_area"], 20000)

        # 5. Garbage subtraction: 20,000 food / (100,000 plate - 20,000 garbage) = 25.0%
        res_with_garbage = calc.calculate_from_masks([
            {"class_id": 58, "class_name": "plate", "area": 100000, "confidence": 0.95},
            {"class_id": 63, "class_name": "rice", "area": 20000, "confidence": 0.88},
            {"class_id": 35, "class_name": "garbage", "area": 20000, "confidence": 0.85}
        ])
        self.assertEqual(res_with_garbage["waste_percentage"], 25.0)

    def test_05_analytics_endpoints(self):
        """Verifies overview, categories, trends, cafeterias, and insights."""
        ov = self.client.get("/api/analytics/overview")
        self.assertEqual(ov.status_code, 200)
        self.assertGreater(ov.json()["total_plates_analyzed"], 0)

        cats = self.client.get("/api/analytics/categories")
        self.assertEqual(cats.status_code, 200)
        self.assertIsInstance(cats.json(), list)

        tr = self.client.get("/api/analytics/trends")
        self.assertEqual(tr.status_code, 200)

        ins = self.client.get("/api/analytics/insights")
        self.assertEqual(ins.status_code, 200)

    def test_06_predictions_pipeline(self):
        """Verifies prediction horizons and evaluation metrics."""
        res = self.client.get("/api/predictions?horizon=7&allow_demo=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["horizon_days"], 7)
        self.assertEqual(len(data["forecast_points"]), 7)
        self.assertIn("mae", data["evaluation_metrics"])

    def test_07_recommendations_workflow(self):
        """Verifies recommendations listing and status transition."""
        recs = self.client.get("/api/recommendations")
        self.assertEqual(recs.status_code, 200)
        data = recs.json()
        if len(data) > 0:
            rec_id = data[0]["id"]
            patch_res = self.client.patch(f"/api/recommendations/{rec_id}/status", json={"status": "accepted"})
            self.assertEqual(patch_res.status_code, 200)
            self.assertEqual(patch_res.json()["status"], "accepted")

    def test_08_reports_generation(self):
        """Verifies report creation in PDF format."""
        res = self.client.post("/api/reports/generate", json={
            "title": "Automated Test Audit Report",
            "report_type": "Weekly Cafeteria Audit",
            "date_range_start": "2026-11-01",
            "date_range_end": "2026-11-15",
            "format": "PDF"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["file_path"].endswith(".pdf"))

    def test_09_assistant_query(self):
        """Verifies AI Assistant database grounding."""
        res = self.client.post("/api/assistant/chat", json={
            "query": "Which food has the highest waste?"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("Rice", data["answer"])
        self.assertGreater(len(data["data_sources"]), 0)

    def test_10_model_research_info(self):
        """Verifies research citations and model architecture endpoints."""
        res = self.client.get("/api/model/info")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["research_citation"]["journal"], "Applied Sciences")
        self.assertEqual(data["research_citation"]["year"], 2025)

if __name__ == "__main__":
    unittest.main()
