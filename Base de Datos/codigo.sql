-- REINICIO: Borra todo para evitar errores de tablas duplicadas
-- Esto no se puede borrar, ten cuidado de no quitarlo sin querer
DROP DATABASE IF EXISTS becas_datase_v2;
CREATE DATABASE becas_datase_v2;
USE becas_datase_v2;
---------------------------------------

-- De aca para abajo copias y pegas todo el codigo

CREATE TABLE Estudiante
(
  CI               INT         NOT NULL,
  Nombres          TEXT(45)    NOT NULL,
  Apellidos        TEXT(45)    NOT NULL,
  F_Nacimiento     DATE        NOT NULL,
  Edad             INT         NOT NULL,
  Telefono         VARCHAR(20) NOT NULL,
  Correo           VARCHAR(45) NOT NULL,
  Estudios_Estatus TEXT(45)    NOT NULL,
  Carnet_Patria    VARCHAR(45) NOT NULL,
  PRIMARY KEY (CI)
);

CREATE TABLE Familiar
(
  CI              INT           NOT NULL AUTO_INCREMENT,
  Nombres         TEXT(100)     NOT NULL,
  Apellidos       TEXT(45)      NOT NULL,
  F_Nacimiento    DATE          NOT NULL,
  Instruccion     TEXT          NOT NULL,
  Ingreso_Mensual DECIMAL(10,2) NOT NULL,
  Ocupacion       TEXT          NOT NULL,
  CI_Estudiante   INT           NOT NULL,
  PRIMARY KEY (CI)
);

CREATE TABLE Record_Academico
(
  ID_Record             INT          NOT NULL AUTO_INCREMENT,
  Materias_Inscritas    INT          NOT NULL,
  Materias_Aprobadas    INT          NOT NULL,
  Materias_Aplazadas    INT          NOT NULL,
  Materias_Inasistentes INT          NOT NULL,
  Indice_Trimestral     DECIMAL(4,2) NOT NULL,
  CI_Estudiante         INT          NOT NULL,
  PRIMARY KEY (ID_Record)
);

CREATE TABLE Residencia
(
  Residencia_Numero INT           NOT NULL AUTO_INCREMENT,
  Tipo_Vivienda     TEXT          NOT NULL,
  Tipo_Estructura   TEXT          NOT NULL,
  Regimen_Propiedad TEXT          NOT NULL,
  Direccion         VARCHAR(45)   NOT NULL,
  Telefono          VARCHAR(20)   NOT NULL,
  Monto_Alquiler    DECIMAL(10,2) NOT NULL,
  CI_Estudiante     INT           NOT NULL,
  PRIMARY KEY (Residencia_Numero)
);

ALTER TABLE Residencia
  ADD CONSTRAINT FK_Estudiante_TO_Residencia
    FOREIGN KEY (CI_Estudiante)
    REFERENCES Estudiante (CI);

ALTER TABLE Familiar
  ADD CONSTRAINT FK_Estudiante_TO_Familiar
    FOREIGN KEY (CI_Estudiante)
    REFERENCES Estudiante (CI);

ALTER TABLE Record_Academico
  ADD CONSTRAINT FK_Estudiante_TO_Record_Academico
    FOREIGN KEY (CI_Estudiante)
    REFERENCES Estudiante (CI);
