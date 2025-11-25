// src/main/java/aptech/tripmate/models/safety/EmergencyContacts.java
package aptech.tripmate.models.safety;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "emergency_contacts")
@Data
public class EmergencyContacts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String country;
    private String police;
    private String fire;
    private String medical;
}
