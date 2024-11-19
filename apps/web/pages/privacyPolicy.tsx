import React from "react";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import LockIcon from "@mui/icons-material/Lock";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PaymentIcon from "@mui/icons-material/Payment";
import EventIcon from "@mui/icons-material/Event";
import SecurityIcon from "@mui/icons-material/Security";
import CookiesIcon from "@mui/icons-material/Cookie";

export default function PrivacyPolicyPage() {
  return (
    <Container maxWidth="md">
      <Box mt={4} mb={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Políticas de Privacidad
        </Typography>
        <Typography variant="h6" align="center" color="primary">
          ¡Tu privacidad es nuestra prioridad!
        </Typography>
      </Box>

      <Box mt={3}>
        <Typography variant="body1" paragraph>
          Los datos personales que recopilamos son estrictamente para el uso de
          Early y nuestros socios organizadores, con el fin de garantizar el
          correcto funcionamiento de nuestros servicios. Cuando sea necesario,
          se pueden compartir de acuerdo con procesadores de datos específicos
          para el alojamiento de datos, marketing y comunicación, procesamiento
          de pagos o mantenimiento. Tenga la seguridad de que ni Early ni sus
          procesadores de datos venden sus datos personales a terceros.
        </Typography>

        <Typography variant="body1" paragraph>
          Early garantiza la seguridad de su información personal mediante una
          combinación de medidas para evitar cualquier uso no autorizado. Esto
          incluye protección con contraseña para el acceso a bases de datos y
          soluciones de seguridad avanzadas.
        </Typography>

        <Typography variant="body1" paragraph>
          Tenga en cuenta que nuestras políticas están sujetas a actualizaciones
          periódicas para alinearse con los desarrollos de la plataforma, los
          servicios o las nuevas regulaciones. Estos cambios se implementan
          pensando en sus mejores intereses, garantizando que sigamos cumpliendo
          con los más altos estándares de seguridad.
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom>
        1. Rol y Responsabilidades de la Plataforma
      </Typography>

      <Typography variant="h6">
        1.1 La Plataforma como Controlador de Datos
      </Typography>

      <List>
        <ListItem>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Información general de los usuarios: login, nombre, apellido, país, DNI, contraseña, correo y teléfono." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LockIcon />
          </ListItemIcon>
          <ListItemText primary="Información legal de los organizadores y eventos: nombre de la entidad, detalles del evento, tickets vendidos." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary="Datos de pago y facturación: dirección de facturación, método de pago e historial de transacciones." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Perfil del cliente: eventos asistidos, eventos seguidos, amigos, biblioteca musical y actividades preferidas." />
        </ListItem>
      </List>

      <Typography variant="h6" mt={3}>
        1.2 La Plataforma como Procesador de Datos
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Contactos de los organizadores subidos a su cuenta." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <EventIcon />
          </ListItemIcon>
          <ListItemText primary="Información de compra de tickets y cualquier información adicional solicitada por los organizadores." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LockIcon />
          </ListItemIcon>
          <ListItemText primary="Información de eventos: nombre de la actividad, fecha y ubicación del evento." />
        </ListItem>
      </List>

      <Typography variant="h5" mt={4} gutterBottom>
        2. Destinatarios de los Datos Personales
      </Typography>
      <Typography variant="body1" paragraph>
        Los datos personales recogidos son necesarios para los fines mencionados
        y están destinados exclusivamente a los servicios internos de la
        Plataforma y a terceros procesadores de datos, tales como:
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="Operaciones diarias: soluciones digitales para gestión de clientes, detección de errores y monitoreo de la plataforma." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="Operaciones de mantenimiento: acceso a la tecnología para realizar mantenimiento o resolver problemas técnicos." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <SecurityIcon />
          </ListItemIcon>
          <ListItemText primary="Marketing y comunicación: soluciones de publicidad y marketing online." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary="Servicios financieros: servicios de procesamiento de pagos." />
        </ListItem>
      </List>

      <Typography variant="h5" mt={4} gutterBottom>
        3. Almacenamiento de Datos Personales
      </Typography>
      <Typography variant="body1" paragraph>
        Los datos personales se almacenan durante toda la relación con la
        Plataforma para cumplir con los fines descritos y las obligaciones
        legales.
      </Typography>

      <Typography variant="h5" mt={4} gutterBottom>
        4. Derechos del Sujeto de Datos
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <PrivacyTipIcon />
          </ListItemIcon>
          <ListItemText primary="Derecho de acceso: conocer qué datos personales tiene la Plataforma sobre ellos y obtener una copia." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <LockIcon />
          </ListItemIcon>
          <ListItemText primary="Derecho de rectificación y eliminación: corregir datos inexactos o desactualizados y solicitar su eliminación." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <PrivacyTipIcon />
          </ListItemIcon>
          <ListItemText primary="Derecho a presentar una queja ante una autoridad supervisora: contactar a la autoridad competente si creen que no se ha cumplido con la Regulación." />
        </ListItem>
      </List>

      <Typography variant="h5" mt={4} gutterBottom>
        5. Transferencias de Datos
      </Typography>
      <Typography variant="body1" paragraph>
        Los datos personales pueden transferirse fuera de Chile. En estos casos,
        se implementan medidas legales, técnicas y organizativas adecuadas para
        proteger los datos personales.
      </Typography>

      <Typography variant="h5" mt={4} gutterBottom>
        6. Cookies
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon>
            <CookiesIcon />
          </ListItemIcon>
          <ListItemText primary="Seguimiento de audiencia y medición de tráfico." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CookiesIcon />
          </ListItemIcon>
          <ListItemText primary="Almacenamiento de preferencias de idioma." />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CookiesIcon />
          </ListItemIcon>
          <ListItemText primary="Almacenamiento de preferencias de consentimiento de cookies." />
        </ListItem>
      </List>

      <Typography variant="h5" mt={4} gutterBottom>
        7. Seguridad
      </Typography>
      <Typography variant="body1" paragraph>
        La Plataforma implementa medidas de seguridad físicas, lógicas y
        organizativas para proteger los datos personales contra alteraciones,
        daños o accesos no autorizados.
      </Typography>

      <Typography variant="h5" mt={4} gutterBottom>
        8. Modificación de la Política
      </Typography>
      <Typography variant="body1" paragraph>
        La Plataforma puede actualizar esta política para reflejar cambios en
        los fines y métodos de procesamiento de datos. Los usuarios serán
        informados de estos cambios con al menos 15 días de anticipación.
      </Typography>
    </Container>
  );
}
