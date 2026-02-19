package com.airesumeanalyzer.airesumeanalyzer.repository;

import com.airesumeanalyzer.airesumeanalyzer.model.Analysis;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnalysisRepository extends JpaRepository<Analysis, Long> {
    List<Analysis> findByResumeId(Long resumeId);
}
