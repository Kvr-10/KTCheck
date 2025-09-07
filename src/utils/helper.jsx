import axios from "axios";
import { USER_API_ENDPOINTS } from "./apis";

export const getAccessTokenFromRefresh = async () => {
  try {
    const rawAuth = localStorage.getItem("KTMgauth");
    if (!rawAuth) throw new Error("No auth data found.");

    const authData = JSON.parse(rawAuth);
    const refreshToken = authData?.refresh;
    // console.log(refreshToken);
    if (!refreshToken) throw new Error("No refresh token available.");

    const res = await axios.post(USER_API_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken
    });

    const { access } = res.data;
    if (!access) throw new Error("Access token not returned.");

    // ✅ Update localStorage with new access token
    const updatedAuth = { ...authData, access };
    localStorage.setItem("KTMgauth", JSON.stringify(updatedAuth));

    return access;

  } catch (error) {
  console.error("❌ Error fetching access token:", error.message);

  // Clear stored authentication data
  localStorage.removeItem("KTMgauth");
  localStorage.removeItem("KTMauth");

  // Redirect to login page
  window.location.href = "/signin";

  return null;
}

};