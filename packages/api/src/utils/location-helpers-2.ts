export type PincodeApiResponse = {
    Message: string;
    Status: string;
    PostOffice: {
        Name: string;
        Description: string | null;
        BranchType: string;
        DeliveryStatus: string;
        Circle: string;
        District: string;
        Division: string;
        Region: string;
        Block: string;
        State: string;
        Country: string;
        Pincode: string;
    }[];
}[];

export type LocationData = {
    state: string;
    district: string;
    taluka: string; // Mapped from Block
    country: string;
    villages: string[]; // Mapped from PostOffice[].Name
};

export async function fetchLocationByPincode(
    pincode: string,
): Promise<LocationData | null> {
    try {
        const response = await fetch(
            `https://api.postalpincode.in/pincode/${pincode}`,
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch pincode data: ${response.statusText}`);
        }

        const data: PincodeApiResponse = await response.json();

        if (
            !data ||
            data.length === 0 ||
            data[0].Status !== "Success" ||
            !data[0].PostOffice
        ) {
            return null;
        }

        const postOffices = data[0].PostOffice;
        if (postOffices.length === 0) return null;

        // We assume the first post office entry represents the administrative region correctly enough for State/District/Block
        const representative = postOffices[0];

        const villages = postOffices.map((po) => po.Name).sort();

        return {
            state: representative.State,
            district: representative.District,
            taluka: representative.Block,
            country: representative.Country,
            villages: [...new Set(villages)], // Remove duplicates
        };
    } catch (error) {
        console.error("Error fetching location by pincode:", error);
        return null;
    }
}
