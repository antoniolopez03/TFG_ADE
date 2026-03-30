import Link from "next/link";

export const metadata = { title: "Política de Privacidad · ProspectAI" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Volver</Link>
        <article className="prose prose-gray mt-8">
          <h1>Política de Privacidad</h1>
          <p className="text-sm text-gray-400">Última actualización: Enero 2025</p>

          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recogidos en esta plataforma es
            el titular del TFG descrito en este proyecto, con dirección en la Universidad Complutense de Madrid.
          </p>

          <h2>2. Datos recogidos y finalidad</h2>
          <p>
            Recogemos exclusivamente el email corporativo y los datos de perfil profesional que el
            usuario proporciona al registrarse. Estos datos se utilizan únicamente para la prestación
            del servicio SaaS descrito en esta plataforma.
          </p>
          <p>
            Los datos de prospectos extraídos del motor de scraping corresponden a información
            corporativa pública (nombre de empresa, web, teléfono genérico). No se almacenan datos
            de personas físicas no identificadas con carácter masivo.
          </p>

          <h2>3. Base jurídica</h2>
          <p>
            El tratamiento se basa en el interés legítimo (Art. 6.1.f RGPD) para las comunicaciones
            B2B entre profesionales, y en el consentimiento explícito del usuario para el acceso
            a la plataforma (Art. 6.1.a RGPD).
          </p>

          <h2>4. Comunicaciones comerciales (Cold Email)</h2>
          <p>
            Las comunicaciones de prospección enviadas a través de la plataforma se amparan en el
            Art. 21.2 LSSI-CE, que permite el envío de comunicaciones comerciales no solicitadas
            cuando se dirigen a personas jurídicas o profesionales, siempre que el mensaje esté
            relacionado con su actividad. Todos los emails incluyen un enlace de baja (opt-out).
          </p>

          <h2>5. Derechos del interesado</h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad y oposición
            contactando con nosotros. Los datos se eliminan automáticamente al darse de baja del servicio
            (ON DELETE CASCADE en la base de datos).
          </p>

          <h2>6. Transferencias internacionales</h2>
          <p>
            Los datos se alojan en servidores de Supabase (AWS, región EU-West) con certificación
            ISO 27001. No se realizan transferencias a terceros países sin garantías adecuadas.
          </p>
        </article>
      </div>
    </div>
  );
}
