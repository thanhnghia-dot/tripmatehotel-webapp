package aptech.tripmate.configs;

import aptech.tripmate.models.Amenity;
import aptech.tripmate.repositories.AmenityRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AmenityDataInitializer implements CommandLineRunner {

    private final AmenityRepository amenityRepository;

    public AmenityDataInitializer(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (amenityRepository.count() == 0) {
            List<Amenity> amenities = List.of(
                    new Amenity(null, "Wi-Fi"),
                    new Amenity(null, "Swimming Pool"),
                    new Amenity(null, "Gym Room"),
                    new Amenity(null, "Parking"),
                    new Amenity(null, "Room Service"),
                    new Amenity(null, "Spa"),
                    new Amenity(null, "Restaurant"),
                    new Amenity(null, "24/7 Reception"),
                    new Amenity(null, "Airport Shuttle"),
                    new Amenity(null, "Bar / Lounge"),
                    new Amenity(null, "Breakfast Included"),
                    new Amenity(null, "Pet Friendly"),
                    new Amenity(null, "Non-smoking Rooms"),
                    new Amenity(null, "Laundry Service"),
                    new Amenity(null, "Concierge"),
                    new Amenity(null, "Business Center"),
                    new Amenity(null, "Meeting Rooms"),
                    new Amenity(null, "Elevator"),
                    new Amenity(null, "Air Conditioning"),
                    new Amenity(null, "Sauna"),
                    new Amenity(null, "Massage Service"),
                    new Amenity(null, "Daily Housekeeping"),
                    new Amenity(null, "Childcare / Babysitting"),
                    new Amenity(null, "Bicycle Rental"),
                    new Amenity(null, "Private Beach")
            );
            amenityRepository.saveAll(amenities);
        }
    }
}
