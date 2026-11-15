import unittest
import requests

BASE_URL = "http://localhost:8000/api"

class TestLiveAPI(unittest.TestCase):
    def test_01_health(self):
        res = requests.get("http://localhost:8000/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["yolo_checkpoint_loaded"])

    def test_02_auth_login(self):
        res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": "admin@foodwise.ai",
            "password": "Admin@1234"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["role"], "Super Admin")

    def test_03_samples(self):
        res = requests.get(f"{BASE_URL}/detection/samples")
        self.assertEqual(res.status_code, 200)
        samples = res.json()
        self.assertGreater(len(samples), 0)

    def test_04_predict_sample(self):
        res = requests.post(f"{BASE_URL}/detection/predict", data={
            "sample_filename": "0_jpeg.rf.4df05c06a5f5a02fe62591ef39399697.jpg"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("waste_percentage", data)
        self.assertIn("waste_analysis", data)
        self.assertTrue(data["model_version"].startswith("YOLOv11"))

    def test_05_analytics(self):
        res = requests.get(f"{BASE_URL}/analytics/overview")
        self.assertEqual(res.status_code, 200)
        self.assertGreater(res.json()["total_plates_analyzed"], 0)

        res_cat = requests.get(f"{BASE_URL}/analytics/categories")
        self.assertEqual(res_cat.status_code, 200)

        res_trends = requests.get(f"{BASE_URL}/analytics/trends")
        self.assertEqual(res_trends.status_code, 200)

    def test_06_predictions(self):
        res = requests.get(f"{BASE_URL}/predictions?horizon=7&allow_demo=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["forecast_points"]), 7)

    def test_07_recommendations(self):
        res = requests.get(f"{BASE_URL}/recommendations")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data), 0)

    def test_08_reports_generation(self):
        res = requests.post(f"{BASE_URL}/reports/generate", json={
            "title": "Automated Live Test Report",
            "report_type": "Weekly Cafeteria Audit",
            "date_range_start": "2026-11-01",
            "date_range_end": "2026-11-15",
            "format": "PDF"
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["file_path"].endswith(".pdf"))

    def test_09_assistant(self):
        res = requests.post(f"{BASE_URL}/assistant/chat", json={
            "query": "Which food has the highest waste?"
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn("Rice", res.json()["answer"])

    def test_10_model_info(self):
        res = requests.get(f"{BASE_URL}/model/info")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["research_citation"]["journal"], "Applied Sciences")

if __name__ == "__main__":
    unittest.main()
