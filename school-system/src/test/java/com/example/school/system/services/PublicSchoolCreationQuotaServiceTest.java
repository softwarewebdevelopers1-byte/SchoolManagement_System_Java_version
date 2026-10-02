package com.example.school.system.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.error.SchoolCreationLimitException;
import com.example.school.system.models.PublicSchoolCreationQuota;
import com.example.school.system.repository.PublicSchoolCreationQuotaRepository;

@ExtendWith(MockitoExtension.class)
class PublicSchoolCreationQuotaServiceTest {
    @Mock
    private PublicSchoolCreationQuotaRepository quotaRepository;

    @Test
    void allowsTwoSchoolRegistrationsThenRejectsFurtherAttemptsFromTheSameAddress() {
        PublicSchoolCreationQuota quota = new PublicSchoolCreationQuota();
        quota.setSchoolsCreated(0);
        when(quotaRepository.findByDeviceKeyForUpdate(anyString())).thenReturn(Optional.of(quota));
        PublicSchoolCreationQuotaService service = new PublicSchoolCreationQuotaService(quotaRepository);

        service.reserve("192.0.2.10");
        service.reserve("192.0.2.10");

        assertThat(quota.getSchoolsCreated()).isEqualTo(2);
        assertThatThrownBy(() -> service.reserve("192.0.2.10"))
                .isInstanceOf(SchoolCreationLimitException.class)
                .hasMessageContaining("maximum of two");
        verify(quotaRepository, times(3)).createQuotaIfAbsent(org.mockito.ArgumentMatchers.argThat(
                key -> key.length() == 64 && !key.equals("192.0.2.10")));
    }
}
