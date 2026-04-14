/**
 * seed_hubspot.js
 * Pobla HubSpot con 15 clientes ficticios del sector maquinaria industrial.
 *
 * USO:
 *   1. Coloca tu token en la variable HUBSPOT_TOKEN de abajo (o usa variable de entorno)
 *   2. node seed_hubspot.js
 *
 * Requiere Node.js 18+ (fetch nativo). Sin dependencias externas.
 */

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN || "PEGA_AQUI_TU_TOKEN_NUEVO";
const BASE = "https://api.hubapi.com";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${HUBSPOT_TOKEN}`,
};

// ─── DATOS DE LOS 15 CLIENTES ───────────────────────────────────────────────

const clientes = [
  {
    empresa: {
      name: "Talleres Metálicos Aragoneses S.L.",
      domain: "tma-aragon.es",
      industry: "MACHINERY",
      city: "Zaragoza",
      country: "Spain",
      phone: "+34 976 234 100",
      numberofemployees: 85,
      annualrevenue: 4200000,
      description: "Fabricación y mantenimiento de maquinaria para la industria agroalimentaria.",
    },
    contacto: {
      firstname: "Carlos",
      lastname: "Montero Ruiz",
      email: "c.montero@tma-aragon.es",
      jobtitle: "Director de Compras",
      phone: "+34 976 234 101",
    },
    deal: {
      dealname: "Talleres Metálicos Aragoneses — Prensa hidráulica 200T",
      amount: 87000,
      dealstage: "qualifiedtobuy",
    },
  },
  {
    empresa: {
      name: "Industrias Ferrán Hermanos S.A.",
      domain: "ferran-ind.com",
      industry: "MACHINERY",
      city: "Barcelona",
      country: "Spain",
      phone: "+34 932 101 450",
      numberofemployees: 210,
      annualrevenue: 18500000,
      description: "Diseño y fabricación de líneas de producción automatizadas para el sector automotriz.",
    },
    contacto: {
      firstname: "Marta",
      lastname: "Ferrán Puig",
      email: "m.ferran@ferran-ind.com",
      jobtitle: "Directora General",
      phone: "+34 932 101 451",
    },
    deal: {
      dealname: "Ferrán Hermanos — Línea ensamblaje robótica",
      amount: 340000,
      dealstage: "presentationscheduled",
    },
  },
  {
    empresa: {
      name: "Mecánica Industrial Levante S.L.",
      domain: "mil-valencia.es",
      industry: "MACHINERY",
      city: "Valencia",
      country: "Spain",
      phone: "+34 963 445 200",
      numberofemployees: 45,
      annualrevenue: 2800000,
      description: "Reparación y venta de maquinaria CNC para pymes del sector metal.",
    },
    contacto: {
      firstname: "Javier",
      lastname: "Soler Climent",
      email: "j.soler@mil-valencia.es",
      jobtitle: "Responsable de Mantenimiento",
      phone: "+34 963 445 201",
    },
    deal: {
      dealname: "MIL Valencia — Torno CNC serie 5000",
      amount: 52000,
      dealstage: "closedwon",
    },
  },
  {
    empresa: {
      name: "Construcciones Metálicas del Norte S.A.",
      domain: "cmnorte.es",
      industry: "MACHINERY",
      city: "Bilbao",
      country: "Spain",
      phone: "+34 944 789 300",
      numberofemployees: 320,
      annualrevenue: 27000000,
      description: "Estructuras metálicas y maquinaria pesada para construcción naval y offshore.",
    },
    contacto: {
      firstname: "Amaia",
      lastname: "Etxebarria Goñi",
      email: "a.etxebarria@cmnorte.es",
      jobtitle: "Directora de Operaciones",
      phone: "+34 944 789 301",
    },
    deal: {
      dealname: "CM Norte — Grúa pórtico 50T",
      amount: 210000,
      dealstage: "decisionmakerboughtin",
    },
  },
  {
    empresa: {
      name: "Agromecánica Castilla S.L.",
      domain: "agromecanica-castilla.com",
      industry: "MACHINERY",
      city: "Valladolid",
      country: "Spain",
      phone: "+34 983 512 600",
      numberofemployees: 60,
      annualrevenue: 3900000,
      description: "Maquinaria agrícola y sistemas de riego para explotaciones cerealistas.",
    },
    contacto: {
      firstname: "Pedro",
      lastname: "García Blanco",
      email: "p.garcia@agromecanica-castilla.com",
      jobtitle: "Director Comercial",
      phone: "+34 983 512 601",
    },
    deal: {
      dealname: "Agromecánica Castilla — Sembradora de precisión",
      amount: 38000,
      dealstage: "closedwon",
    },
  },
  {
    empresa: {
      name: "Tecnomec Andalucía S.L.",
      domain: "tecnomec.es",
      industry: "MACHINERY",
      city: "Sevilla",
      country: "Spain",
      phone: "+34 954 678 900",
      numberofemployees: 130,
      annualrevenue: 9500000,
      description: "Soluciones de automatización industrial para el sector agroalimentario andaluz.",
    },
    contacto: {
      firstname: "Rocío",
      lastname: "Delgado Morales",
      email: "r.delgado@tecnomec.es",
      jobtitle: "Responsable de Compras",
      phone: "+34 954 678 901",
    },
    deal: {
      dealname: "Tecnomec — Sistema automatizado embotellado",
      amount: 125000,
      dealstage: "qualifiedtobuy",
    },
  },
  {
    empresa: {
      name: "Schneider Ibérica Maquinaria S.A.",
      domain: "schneider-iberica.es",
      industry: "MACHINERY",
      city: "Madrid",
      country: "Spain",
      phone: "+34 915 334 200",
      numberofemployees: 500,
      annualrevenue: 65000000,
      description: "Filial española de grupo europeo fabricante de maquinaria eléctrica industrial.",
    },
    contacto: {
      firstname: "Thomas",
      lastname: "Brauer",
      email: "t.brauer@schneider-iberica.es",
      jobtitle: "VP de Operaciones Europa Sur",
      phone: "+34 915 334 201",
    },
    deal: {
      dealname: "Schneider Ibérica — Transformadores serie HV",
      amount: 480000,
      dealstage: "presentationscheduled",
    },
  },
  {
    empresa: {
      name: "Forja Navarra S.A.",
      domain: "forja-navarra.com",
      industry: "MACHINERY",
      city: "Pamplona",
      country: "Spain",
      phone: "+34 948 201 750",
      numberofemployees: 175,
      annualrevenue: 14000000,
      description: "Forja en caliente y tratamientos térmicos para componentes de automoción.",
    },
    contacto: {
      firstname: "Ignacio",
      lastname: "Urdániz Larrañeta",
      email: "i.urdaniz@forja-navarra.com",
      jobtitle: "Director de Producción",
      phone: "+34 948 201 751",
    },
    deal: {
      dealname: "Forja Navarra — Prensa forja 500T renovación",
      amount: 290000,
      dealstage: "decisionmakerboughtin",
    },
  },
  {
    empresa: {
      name: "Hidráulica del Mediterráneo S.L.",
      domain: "hidraulica-med.es",
      industry: "MACHINERY",
      city: "Alicante",
      country: "Spain",
      phone: "+34 965 123 400",
      numberofemployees: 38,
      annualrevenue: 2100000,
      description: "Sistemas hidráulicos y neumáticos para maquinaria de construcción y minería.",
    },
    contacto: {
      firstname: "Lucia",
      lastname: "Navarro Sempere",
      email: "l.navarro@hidraulica-med.es",
      jobtitle: "Gerente",
      phone: "+34 965 123 401",
    },
    deal: {
      dealname: "Hidráulica Med — Central hidráulica 180 bar",
      amount: 44000,
      dealstage: "closedlost",
    },
  },
  {
    empresa: {
      name: "Mecatrónica Gallega S.L.",
      domain: "mecatronica-galicia.com",
      industry: "MACHINERY",
      city: "Vigo",
      country: "Spain",
      phone: "+34 986 445 800",
      numberofemployees: 90,
      annualrevenue: 6700000,
      description: "Integración de sistemas robóticos para la industria conservera y pesquera.",
    },
    contacto: {
      firstname: "Manuel",
      lastname: "Fernández Castaño",
      email: "m.fernandez@mecatronica-galicia.com",
      jobtitle: "Director Técnico",
      phone: "+34 986 445 801",
    },
    deal: {
      dealname: "Mecatrónica Gallega — Robot paletizador serie G",
      amount: 98000,
      dealstage: "qualifiedtobuy",
    },
  },
  {
    empresa: {
      name: "Fundiciones Extremeñas S.A.",
      domain: "fundicion-ex.es",
      industry: "MACHINERY",
      city: "Mérida",
      country: "Spain",
      phone: "+34 924 300 100",
      numberofemployees: 140,
      annualrevenue: 8900000,
      description: "Fundición de hierro gris y nodular para componentes de maquinaria agrícola.",
    },
    contacto: {
      firstname: "Elena",
      lastname: "Sánchez Romero",
      email: "e.sanchez@fundicion-ex.es",
      jobtitle: "Responsable de Aprovisionamiento",
      phone: "+34 924 300 101",
    },
    deal: {
      dealname: "Fundiciones Extremeñas — Horno cubilote 3T/h",
      amount: 165000,
      dealstage: "presentationscheduled",
    },
  },
  {
    empresa: {
      name: "Polymer Machines Italia S.p.A.",
      domain: "polymermachines.it",
      industry: "MACHINERY",
      city: "Milán",
      country: "Italy",
      phone: "+39 02 8765 4300",
      numberofemployees: 280,
      annualrevenue: 32000000,
      description: "Maquinaria de inyección y extrusión de plásticos para el sector packaging.",
    },
    contacto: {
      firstname: "Giovanni",
      lastname: "Rossi",
      email: "g.rossi@polymermachines.it",
      jobtitle: "Head of Procurement",
      phone: "+39 02 8765 4301",
    },
    deal: {
      dealname: "Polymer Machines — Inyectora 1200T serie K",
      amount: 390000,
      dealstage: "decisionmakerboughtin",
    },
  },
  {
    empresa: {
      name: "Werkzeug Bayern GmbH",
      domain: "werkzeug-bayern.de",
      industry: "MACHINERY",
      city: "Múnich",
      country: "Germany",
      phone: "+49 89 4500 2300",
      numberofemployees: 420,
      annualrevenue: 51000000,
      description: "Herramientas de corte y mecanizado de precisión para la industria aeroespacial.",
    },
    contacto: {
      firstname: "Klaus",
      lastname: "Hoffmann",
      email: "k.hoffmann@werkzeug-bayern.de",
      jobtitle: "Einkaufsleiter",
      phone: "+49 89 4500 2301",
    },
    deal: {
      dealname: "Werkzeug Bayern — Centro mecanizado 5 ejes",
      amount: 620000,
      dealstage: "qualifiedtobuy",
    },
  },
  {
    empresa: {
      name: "Textil Maquinaria Coimbra Lda.",
      domain: "texmaq-coimbra.pt",
      industry: "MACHINERY",
      city: "Coimbra",
      country: "Portugal",
      phone: "+351 239 800 400",
      numberofemployees: 55,
      annualrevenue: 3400000,
      description: "Maquinaria textil de segunda mano y repuestos para la industria portuguesa.",
    },
    contacto: {
      firstname: "Ana",
      lastname: "Ferreira Costa",
      email: "a.ferreira@texmaq-coimbra.pt",
      jobtitle: "Diretora Comercial",
      phone: "+351 239 800 401",
    },
    deal: {
      dealname: "TexMaq Coimbra — Telares Jacquard x8 unidades",
      amount: 72000,
      dealstage: "closedwon",
    },
  },
  {
    empresa: {
      name: "Canarias Maquinaria Industrial S.L.",
      domain: "canarias-maqind.es",
      industry: "MACHINERY",
      city: "Las Palmas de Gran Canaria",
      country: "Spain",
      phone: "+34 928 456 700",
      numberofemployees: 28,
      annualrevenue: 1600000,
      description: "Importación y mantenimiento de maquinaria industrial para el archipiélago canario.",
    },
    contacto: {
      firstname: "Adrián",
      lastname: "Cabrera Suárez",
      email: "a.cabrera@canarias-maqind.es",
      jobtitle: "Director General",
      phone: "+34 928 456 701",
    },
    deal: {
      dealname: "Canarias MaqInd — Compresor industrial 75kW",
      amount: 29000,
      dealstage: "qualifiedtobuy",
    },
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function hubspot(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`HubSpot ${method} ${path} → ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── LÓGICA PRINCIPAL ─────────────────────────────────────────────────────────

async function seed() {
  console.log("🚀 Iniciando seed de HubSpot...\n");

  for (let i = 0; i < clientes.length; i++) {
    const { empresa, contacto, deal } = clientes[i];
    console.log(`[${i + 1}/15] ${empresa.name}`);

    try {
      // 1. Crear empresa (Company)
      const companyRes = await hubspot("POST", "/crm/v3/objects/companies", {
        properties: {
          name: empresa.name,
          domain: empresa.domain,
          industry: empresa.industry,
          city: empresa.city,
          country: empresa.country,
          phone: empresa.phone,
          numberofemployees: String(empresa.numberofemployees),
          annualrevenue: String(empresa.annualrevenue),
          description: empresa.description,
          lifecyclestage: "customer",
        },
      });
      const companyId = companyRes.id;
      console.log(`   ✓ Company creada (id: ${companyId})`);

      // 2. Crear contacto (Contact)
      const contactRes = await hubspot("POST", "/crm/v3/objects/contacts", {
        properties: {
          firstname: contacto.firstname,
          lastname: contacto.lastname,
          email: contacto.email,
          jobtitle: contacto.jobtitle,
          phone: contacto.phone,
          lifecyclestage: "customer",
          hs_lead_status: "OPEN",
        },
      });
      const contactId = contactRes.id;
      console.log(`   ✓ Contact creado (id: ${contactId})`);

      // 3. Asociar contacto → empresa
      await hubspot(
        "PUT",
        `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
        {}
      );
      console.log(`   ✓ Asociación contact → company`);

      // 4. Crear deal
      const dealRes = await hubspot("POST", "/crm/v3/objects/deals", {
        properties: {
          dealname: deal.dealname,
          amount: String(deal.amount),
          dealstage: deal.dealstage,
          pipeline: "default",
          closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
      });
      const dealId = dealRes.id;
      console.log(`   ✓ Deal creado (id: ${dealId})`);

      // 5. Asociar deal → empresa
      await hubspot(
        "PUT",
        `/crm/v3/objects/deals/${dealId}/associations/companies/${companyId}/deal_to_company`,
        {}
      );

      // 6. Asociar deal → contacto
      await hubspot(
        "PUT",
        `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
        {}
      );
      console.log(`   ✓ Deal asociado a company y contact\n`);

    } catch (err) {
      console.error(`   ✗ Error en ${empresa.name}: ${err.message}\n`);
    }

    // Pausa entre requests para no golpear el rate limit
    if (i < clientes.length - 1) await sleep(300);
  }

  console.log("✅ Seed completado.");
}

seed();