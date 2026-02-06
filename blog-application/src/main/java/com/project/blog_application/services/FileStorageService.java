package com.project.blog_application.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadRoot;
    private final String publicBasePath;

    public FileStorageService(
            @Value("${file.upload-dir}") String uploadDir,
            @Value("${file.public-base-path:/uploads}") String publicBasePath
    ) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.publicBasePath = publicBasePath;

        try {
            Files.createDirectories(this.uploadRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory", e);
        }
    }


     // Stores a file and returns the stored filename (NOT URL)

    public String store(MultipartFile file) {
        validateFile(file);

        String cleanFilename = generateSafeFilename(file.getOriginalFilename());
        Path destination = uploadRoot.resolve(cleanFilename);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + cleanFilename, e);
        }

        return cleanFilename;
    }


    public void delete(String filename) {
        if (filename == null || filename.isBlank()) return;

        try {
            Path filePath = uploadRoot.resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Do NOT crash app for cleanup failure
            System.err.println("Failed to delete file: " + filename);
        }
    }

    public String buildPublicUrl(String filename) {
        if (filename == null || filename.isBlank()) return null;

        if (filename.startsWith(publicBasePath)) {
            return filename; // already public
        }

        return publicBasePath + "/" + filename;
    }


    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file");
        }
    }

    private String generateSafeFilename(String originalFilename) {
        String ext = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        return UUID.randomUUID() + ext;
    }

}
