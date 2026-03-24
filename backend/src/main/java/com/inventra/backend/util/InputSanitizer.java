package com.inventra.backend.util;

import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    public String sanitize(String value) {
        if (value == null) {
            return null;
        }
        String sanitized = value.trim();
        sanitized = sanitized.replaceAll("(?i)<script.*?>.*?</script>", "");
        sanitized = sanitized.replaceAll("(?i)javascript:", "");
        sanitized = sanitized.replaceAll("(?i)on\\w+=", "");
        return sanitized;
    }
}
