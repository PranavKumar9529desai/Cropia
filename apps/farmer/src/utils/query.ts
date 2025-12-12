import { apiClient } from "../lib/rpc";

const response = await apiClient.api.locations.$post({
  json: {
    latitude: 0,
    longitude: 0,
    city: "sada",
    state: "as",
    pincode: "as",
    address: "asd",
    village: "as",
    country: "as",
    district: "as",
  },
});

console.log("reponse", response);
