package com.nexobank.backend.domain.fraud;
import com.nexobank.backend.common.exception.ResourceNotFoundException;
import com.nexobank.backend.domain.fraud.dto.*;
import com.nexobank.backend.domain.transfer.Transfer;
import com.nexobank.backend.domain.user.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;
@Service
public class FraudAlertService {
 static final BigDecimal HIGH_AMOUNT_THRESHOLD = new BigDecimal("1000000.00");
 private final FraudAlertRepository alerts; private final UserRepository users; private final Clock clock;
 public FraudAlertService(FraudAlertRepository alerts, UserRepository users, Clock clock) { this.alerts=alerts; this.users=users; this.clock=clock; }
 @Transactional public void evaluate(Transfer transfer) {
  if (transfer.getAmount().compareTo(HIGH_AMOUNT_THRESHOLD)>=0) alerts.save(new FraudAlert(transfer,
   transfer.getSourceAccount(), transfer.getSourceAccount().getCustomer(), "HIGH_AMOUNT_TRANSFER",
   FraudAlertSeverity.HIGH, "Transferencia igual o superior a 1.000.000"));
 }
 @Transactional(readOnly=true) public FraudAlertPageResponse findAll(FraudAlertStatus status, FraudAlertSeverity severity, int page, int size) {
  Specification<FraudAlert> spec=(root,query,cb)->cb.conjunction();
  if(status!=null) spec=spec.and((root,query,cb)->cb.equal(root.get("status"),status));
  if(severity!=null) spec=spec.and((root,query,cb)->cb.equal(root.get("severity"),severity));
  return FraudAlertPageResponse.from(alerts.findAll(spec,PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt"))).map(FraudAlertResponse::from));
 }
 @Transactional public FraudAlertResponse review(UUID id, FraudAlertStatus status, UUID reviewerId) {
  if(status==FraudAlertStatus.OPEN) throw new FraudAlertConflictException("A reviewed alert cannot be returned to OPEN");
  FraudAlert alert=alerts.findById(id).orElseThrow(()->new ResourceNotFoundException("Fraud alert not found"));
  User reviewer=users.findById(reviewerId).orElseThrow(()->new ResourceNotFoundException("Reviewer not found"));
  alert.review(status,reviewer,Instant.now(clock)); return FraudAlertResponse.from(alert);
 }
}
