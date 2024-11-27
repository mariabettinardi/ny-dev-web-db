CREATE DATABASE IF NOT EXISTS nytimes;

USE nytimes;

CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    byline VARCHAR(255),
    published_date DATE NOT NULL
    abstract VARCHAR(500) NULL
);
