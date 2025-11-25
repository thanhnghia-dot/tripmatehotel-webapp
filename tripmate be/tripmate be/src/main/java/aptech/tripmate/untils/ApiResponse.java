package aptech.tripmate.untils;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;

import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private T data;
    private String message;
    private int status;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<String> errors;
    public ApiResponse(T data,String message,int status){
        this.data = data;
        this.message = message;
        this.status = status;
    }
    //success
    public static <T> ApiResponse<T>
    success(T data,String message){
        return new ApiResponse<>
                (data,message,200);
    }
    //created
    public static <T> ApiResponse<T>
    created(T data,String message){
        return new ApiResponse<>
                (data,message,201);
    }
    //not found
    public static <T> ApiResponse<T>
    notfound(String message){
        return new ApiResponse<>
                (null,message,404,null);
    }
    //badRequest
    public static <T> ApiResponse<Object>
    badRequest(BindingResult bindingResult){
        List<String> errorsBadrequest = bindingResult.getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.toList());
        return  new ApiResponse<>
                (null,"Validation errors",400,errorsBadrequest);
    }
    //error server
    public static <T> ApiResponse<T>
    errorServer(String message){
        return new ApiResponse<>(null,message,
                500,null);
    }
    // error client (ví dụ: nhập sai, không đủ quyền...)
    public static <T> ApiResponse<T> errorClient(String message) {
        return new ApiResponse<>(null, message, 400, null);
    }
}
