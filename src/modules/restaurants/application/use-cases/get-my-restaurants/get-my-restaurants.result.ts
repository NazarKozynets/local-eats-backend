export type RestaurantSummaryResult = {
    id: string;
    name: string;
    status: string;
    verificationStatus: string;
    city: string;
    staffRole: string;
    createdAt: Date;
};

export type GetMyRestaurantsResult = RestaurantSummaryResult[];
