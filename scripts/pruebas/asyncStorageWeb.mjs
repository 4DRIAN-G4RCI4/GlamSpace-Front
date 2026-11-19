// Solo pruebas · AsyncStorage para web (usa window.localStorage) con su `default` como en Metro.
// Node importa el paquete como CommonJS y el `default` llega envuelto: aquí se desenvuelve.
import paquete from "@react-native-async-storage/async-storage";

export default paquete.default ?? paquete;
