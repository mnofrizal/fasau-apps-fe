import { API_URL } from "@/lib/config";

export async function getReports() {
  const response = await fetch(`${API_URL}/report`);
  const data = await response.json();
  return data;
}

export async function getReportsToday() {
  const response = await fetch(`${API_URL}/report/filter/today`);
  const data = await response.json();
  return data;
}

export async function createReport(reportData) {
  const response = await fetch(`${API_URL}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportData),
  });
  const data = await response.json();
  return data;
}

export async function updateReport(id, reportData) {
  const response = await fetch(`${API_URL}/report/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reportData),
  });
  const data = await response.json();
  return data;
}

export async function deleteReport(id) {
  const response = await fetch(`${API_URL}/report/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
}

// For development, let's use the real API instead of mock data
export const mockReports = {
  success: true,
  message: "Reports retrieved successfully",
  data: [], // This will be populated by the actual API call
};

// Function to get reports is already defined above and will use the real API endpoint
