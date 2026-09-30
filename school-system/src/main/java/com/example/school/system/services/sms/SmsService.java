package com.example.school.system.services.sms;

import java.util.Collection;
import java.util.List;

public interface SmsService {
    List<SmsSendResult> sendBulkSms(Collection<SmsMessage> messages);
}
