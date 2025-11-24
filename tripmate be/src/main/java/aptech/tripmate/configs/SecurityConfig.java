package aptech.tripmate.configs;

import aptech.tripmate.jwt.JwtFilter;
import aptech.tripmate.services.AuthenticationSuccessHandler;
import aptech.tripmate.services.MyUserDetailService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.HttpMethod;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private MyUserDetailService myUserDetailService;
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));  // Thay bằng domain frontend nếu khác
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/backend/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/partner/**").hasRole("PARTNER")
                        .requestMatchers("/api/user/login", "/api/user/register", "/api/user/send-otp", "/api/user/forgot-password",
                                "/api/user/reset-password", "/api/user/me").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**").permitAll()
                        .requestMatchers("/api/sos/email").permitAll() // ✅ Thêm cho SOS
                        .requestMatchers("/api/hotels").permitAll()
                        .requestMatchers("/api/rooms").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/trips/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/albums/my", "/api/albums/create").hasRole("USER")
                        .requestMatchers("/api/photos/**").permitAll()
                        .requestMatchers("/api/checklists/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/articles/listArticle").permitAll() // ai cũng xem được
                        .requestMatchers(HttpMethod.POST, "/api/articles/upload").hasAnyRole("USER", "ADMIN") // chỉ user đã login
                        .requestMatchers("/api/albums/**").authenticated()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/trips/**/budgets").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/hotel-reviews/**").permitAll()
                        .requestMatchers("/api/ai/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/ai/budget/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/feels/**").permitAll() // Xem feel, xem video
                        .requestMatchers(HttpMethod.POST, "/api/feels").hasAnyRole("USER", "ADMIN") // Đăng feel
                        .requestMatchers(HttpMethod.POST, "/api/feels/*/like").hasAnyRole("USER", "ADMIN") // Like
                        .requestMatchers(HttpMethod.POST, "/api/feels/*/comment").hasAnyRole("USER", "ADMIN") // Comment
                        .requestMatchers(HttpMethod.DELETE, "/api/feels/*").hasAnyRole("USER", "ADMIN") // Xoá feel (nếu là chủ hoặc admin)
                        .requestMatchers( "/api/currency/*").hasAnyRole("USER", "ADMIN")
                        .requestMatchers( "/api/user/me/*").hasAnyRole("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((req, res, ex) -> res.setStatus(HttpServletResponse.SC_UNAUTHORIZED))
                        .accessDeniedHandler((req, res, ex) -> res.setStatus(HttpServletResponse.SC_FORBIDDEN)) // ⛔ Nếu có token nhưng sai role
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(MyUserDetailService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}