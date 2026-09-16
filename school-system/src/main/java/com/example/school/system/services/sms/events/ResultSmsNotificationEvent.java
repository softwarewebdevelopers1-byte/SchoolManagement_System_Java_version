package com.example.school.system.services.sms.events;

import java.util.List;
import java.util.UUID;

public record ResultSmsNotificationEvent(List<UUID> notificationIds) {
}
