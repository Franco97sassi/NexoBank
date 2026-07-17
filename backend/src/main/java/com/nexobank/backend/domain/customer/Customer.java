package com.nexobank.backend.domain.customer;

import com.nexobank.backend.common.model.BaseEntity;
import com.nexobank.backend.domain.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "customers")
public class Customer extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "document_number", nullable = false, unique = true, length = 20)
    private String documentNumber;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(length = 30)
    private String phone;

    protected Customer() {
    }

    public Customer(
            User user,
            String firstName,
            String lastName,
            String documentNumber,
            LocalDate birthDate,
            String phone
    ) {
        this.user = user;
        this.firstName = firstName;
        this.lastName = lastName;
        this.documentNumber = documentNumber;
        this.birthDate = birthDate;
        this.phone = phone;
    }

    public User getUser() {
        return user;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getDocumentNumber() {
        return documentNumber;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public String getPhone() {
        return phone;
    }
}