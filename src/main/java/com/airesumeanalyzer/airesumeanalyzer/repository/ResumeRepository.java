package com.airesumeanalyzer.airesumeanalyzer.repository;

import com.airesumeanalyzer.airesumeanalyzer.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByUserId(Long userId);
}
