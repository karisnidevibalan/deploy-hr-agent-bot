// Represents a holiday as defined in holidays.json
export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
    type: string;
    optional?: boolean;
}
export interface Employee {
    id: string;
    name: string;
    email: string;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
}

export interface WfhRequest {
    id: string;
    employeeId: string;
    startDate: Date;
    endDate: Date;
    reason: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface ApiRequest {
    body: any;
    params: any;
    query: any;
}