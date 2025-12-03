import axios from "axios";
import { BASE } from "./BASE_URL";

const URL = `${BASE}/api`;

export async function getJobsByZipcode(zipcode: string) {
  try {
    const response = await axios.get(`${URL}/jobs/public/zipcode/${zipcode}`);

    return response.data; // success, count, data (jobs array)
  } catch (error: any) {
    console.error("Error fetching jobs by zipcode:", error);

    // handle axios error format
    if (error.response) {
      throw new Error(error.response.data.message || "Request failed");
    } else {
      throw new Error("Network error");
    }
  }
}



export interface ApplyJobPayload {
  name: string;
  mobileNumber: string;
  email?: string;
  age?: number;
  gender?: string;
  whatsappNumber?: string;
  address?: string;
  experience?: string;
  skills?: string[];
  expectedSalary?: string;
  resumeUrl?: string;
  additionalDocuments?: string[];
}

export async function applyForJob(jobId: string, data: ApplyJobPayload) {
  try {
    const response = await axios.post(
      `${URL}/jobs/public/${jobId}/apply`,
      data
    );

    return response.data;
  } catch (error: any) {
    console.log("Apply Job API Error:", error);

    if (error.response) {
      throw new Error(error.response.data.message || "Job application failed");
    } else {
      throw new Error("Network error");
    }
  }
}
