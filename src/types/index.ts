import { FieldValue, Timestamp } from "firebase/firestore";

export interface User {
    id: string;
    name: string;
    email: string;
    imageUrL: string;
    createdAt: Timestamp | FieldValue;
    updateAt: Timestamp | FieldValue;
}