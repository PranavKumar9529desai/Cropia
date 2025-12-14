import { apiClient } from "../lib/rpc";

const response = await apiClient.api.locations.villages.$get({

})

console.log("reponse from the village endpoint", response);
