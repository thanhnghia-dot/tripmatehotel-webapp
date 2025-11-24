package aptech.tripmate.untils;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.github.andrewoma.dexx.collection.HashMap;
import com.github.andrewoma.dexx.collection.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<?>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.errorServer(ex.getMessage()));
    }

    @ExceptionHandler(DuplicateHotelException.class)
    public ResponseEntity<ApiResponse<?>> handleDuplicateHotelException(DuplicateHotelException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.errorServer(ex.getMessage()));
    }
}

