package com.iicmr.eduportal.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String address;
    private String guardianName;
    private String guardianPhone;
    // Faculty fields
    private String department;
    private String designation;
    private String qualification;
}
