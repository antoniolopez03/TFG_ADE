/**
 * hubspot-industry-mapper.ts
 *
 * Mapper completo de sectores industriales al enum de HubSpot.
 * Cubre traducciones desde español, inglés informal, códigos CNAE,
 * variantes con/sin tilde, abreviaturas y términos de Apollo.io.
 *
 * Uso:
 *   import { mapIndustryToHubSpot } from "./hubspot-industry-mapper";
 *   const hubspotValue = mapIndustryToHubSpot("metalurgia"); // → "MINING_METALS"
 */

// ─────────────────────────────────────────────────────────────────────────────
// Tipo del enum oficial de HubSpot (campo `industry` en Companies)
// ─────────────────────────────────────────────────────────────────────────────
export type HubSpotIndustry =
  | "ACCOUNTING"
  | "AIRLINES_AVIATION"
  | "ALTERNATIVE_DISPUTE_RESOLUTION"
  | "ALTERNATIVE_MEDICINE"
  | "ANIMATION"
  | "APPAREL_FASHION"
  | "ARCHITECTURE_PLANNING"
  | "ARTS_AND_CRAFTS"
  | "AUTOMOTIVE"
  | "AVIATION_AEROSPACE"
  | "BANKING"
  | "BIOTECHNOLOGY"
  | "BROADCAST_MEDIA"
  | "BUILDING_MATERIALS"
  | "BUSINESS_SUPPLIES_AND_EQUIPMENT"
  | "CAPITAL_MARKETS"
  | "CHEMICALS"
  | "CIVIC_SOCIAL_ORGANIZATION"
  | "CIVIL_ENGINEERING"
  | "COMMERCIAL_REAL_ESTATE"
  | "COMPUTER_NETWORK_SECURITY"
  | "COMPUTER_GAMES"
  | "COMPUTER_HARDWARE"
  | "COMPUTER_NETWORKING"
  | "COMPUTER_SOFTWARE"
  | "INTERNET"
  | "CONSTRUCTION"
  | "CONSUMER_ELECTRONICS"
  | "CONSUMER_GOODS"
  | "CONSUMER_SERVICES"
  | "COSMETICS"
  | "DAIRY"
  | "DEFENSE_SPACE"
  | "DESIGN"
  | "EDUCATION_MANAGEMENT"
  | "E_LEARNING"
  | "ELECTRICAL_ELECTRONIC_MANUFACTURING"
  | "ENTERTAINMENT"
  | "ENVIRONMENTAL_SERVICES"
  | "EVENTS_SERVICES"
  | "EXECUTIVE_OFFICE"
  | "FACILITIES_SERVICES"
  | "FARMING"
  | "FINANCIAL_SERVICES"
  | "FINE_ART"
  | "FISHERY"
  | "FOOD_BEVERAGES"
  | "FOOD_PRODUCTION"
  | "FUND_RAISING"
  | "FURNITURE"
  | "GAMBLING_CASINOS"
  | "GLASS_CERAMICS_CONCRETE"
  | "GOVERNMENT_ADMINISTRATION"
  | "GOVERNMENT_RELATIONS"
  | "GRAPHIC_DESIGN"
  | "HEALTH_WELLNESS_AND_FITNESS"
  | "HIGHER_EDUCATION"
  | "HOSPITAL_HEALTH_CARE"
  | "HOSPITALITY"
  | "HUMAN_RESOURCES"
  | "IMPORT_AND_EXPORT"
  | "INDIVIDUAL_FAMILY_SERVICES"
  | "INDUSTRIAL_AUTOMATION"
  | "INFORMATION_SERVICES"
  | "INFORMATION_TECHNOLOGY_AND_SERVICES"
  | "INSURANCE"
  | "INTERNATIONAL_AFFAIRS"
  | "INTERNATIONAL_TRADE_AND_DEVELOPMENT"
  | "INVESTMENT_BANKING"
  | "INVESTMENT_MANAGEMENT"
  | "JUDICIARY"
  | "LAW_ENFORCEMENT"
  | "LAW_PRACTICE"
  | "LEGAL_SERVICES"
  | "LEGISLATIVE_OFFICE"
  | "LEISURE_TRAVEL_TOURISM"
  | "LIBRARIES"
  | "LOGISTICS_AND_SUPPLY_CHAIN"
  | "LUXURY_GOODS_JEWELRY"
  | "MACHINERY"
  | "MANAGEMENT_CONSULTING"
  | "MARITIME"
  | "MARKET_RESEARCH"
  | "MARKETING_AND_ADVERTISING"
  | "MECHANICAL_OR_INDUSTRIAL_ENGINEERING"
  | "MEDIA_PRODUCTION"
  | "MEDICAL_DEVICES"
  | "MEDICAL_PRACTICE"
  | "MENTAL_HEALTH_CARE"
  | "MILITARY"
  | "MINING_METALS"
  | "MOTION_PICTURES_AND_FILM"
  | "MUSEUMS_AND_INSTITUTIONS"
  | "MUSIC"
  | "NANOTECHNOLOGY"
  | "NEWSPAPERS"
  | "NON_PROFIT_ORGANIZATION_MANAGEMENT"
  | "OIL_ENERGY"
  | "ONLINE_MEDIA"
  | "OUTSOURCING_OFFSHORING"
  | "PACKAGE_FREIGHT_DELIVERY"
  | "PACKAGING_AND_CONTAINERS"
  | "PAPER_FOREST_PRODUCTS"
  | "PERFORMING_ARTS"
  | "PHARMACEUTICALS"
  | "PHILANTHROPY"
  | "PHOTOGRAPHY"
  | "PLASTICS"
  | "POLITICAL_ORGANIZATION"
  | "PRIMARY_SECONDARY_EDUCATION"
  | "PRINTING"
  | "PROFESSIONAL_TRAINING_COACHING"
  | "PROGRAM_DEVELOPMENT"
  | "PUBLIC_POLICY"
  | "PUBLIC_RELATIONS_AND_COMMUNICATIONS"
  | "PUBLIC_SAFETY"
  | "PUBLISHING"
  | "RAILROAD_MANUFACTURE"
  | "RANCHING"
  | "REAL_ESTATE"
  | "RECREATIONAL_FACILITIES_AND_SERVICES"
  | "RELIGIOUS_INSTITUTIONS"
  | "RENEWABLES_ENVIRONMENT"
  | "RESEARCH"
  | "RESTAURANTS"
  | "RETAIL"
  | "SECURITY_AND_INVESTIGATIONS"
  | "SEMICONDUCTORS"
  | "SHIPBUILDING"
  | "SPORTING_GOODS"
  | "SPORTS"
  | "STAFFING_AND_RECRUITING"
  | "SUPERMARKETS"
  | "TELECOMMUNICATIONS"
  | "TEXTILES"
  | "THINK_TANKS"
  | "TOBACCO"
  | "TRANSLATION_AND_LOCALIZATION"
  | "TRANSPORTATION_TRUCKING_RAILROAD"
  | "UTILITIES"
  | "VENTURE_CAPITAL_PRIVATE_EQUITY"
  | "VETERINARY"
  | "WAREHOUSING"
  | "WHOLESALE"
  | "WINE_AND_SPIRITS"
  | "WIRELESS"
  | "WRITING_AND_EDITING"
  | "MOBILE_GAMES";

// ─────────────────────────────────────────────────────────────────────────────
// Tabla de mapeo: clave normalizada (minúsculas, sin tilde) → HubSpotIndustry
// ─────────────────────────────────────────────────────────────────────────────
const INDUSTRY_MAP: Record<string, HubSpotIndustry> = {

  // ── CONTABILIDAD / AUDITORÍA ──────────────────────────────────────────────
  "contabilidad": "ACCOUNTING",
  "auditoria": "ACCOUNTING",
  "auditoría": "ACCOUNTING",
  "contable": "ACCOUNTING",
  "accounting": "ACCOUNTING",
  "asesoría fiscal": "ACCOUNTING",
  "asesoria fiscal": "ACCOUNTING",
  "gestoría": "ACCOUNTING",
  "gestoria": "ACCOUNTING",

  // ── AEROLÍNEAS / AVIACIÓN ─────────────────────────────────────────────────
  "aerolineas": "AIRLINES_AVIATION",
  "aerolíneas": "AIRLINES_AVIATION",
  "aviacion": "AIRLINES_AVIATION",
  "aviación": "AIRLINES_AVIATION",
  "airlines": "AIRLINES_AVIATION",
  "transporte aéreo": "AIRLINES_AVIATION",
  "transporte aereo": "AIRLINES_AVIATION",

  // ── RESOLUCIÓN ALTERNATIVA DE CONFLICTOS ──────────────────────────────────
  "mediacion": "ALTERNATIVE_DISPUTE_RESOLUTION",
  "mediación": "ALTERNATIVE_DISPUTE_RESOLUTION",
  "arbitraje": "ALTERNATIVE_DISPUTE_RESOLUTION",
  "resolucion de conflictos": "ALTERNATIVE_DISPUTE_RESOLUTION",

  // ── MEDICINA ALTERNATIVA ──────────────────────────────────────────────────
  "medicina alternativa": "ALTERNATIVE_MEDICINE",
  "naturopatia": "ALTERNATIVE_MEDICINE",
  "naturopatía": "ALTERNATIVE_MEDICINE",
  "homeopatia": "ALTERNATIVE_MEDICINE",
  "homeopatía": "ALTERNATIVE_MEDICINE",
  "acupuntura": "ALTERNATIVE_MEDICINE",
  "terapias alternativas": "ALTERNATIVE_MEDICINE",

  // ── ANIMACIÓN ─────────────────────────────────────────────────────────────
  "animacion": "ANIMATION",
  "animación": "ANIMATION",
  "animation": "ANIMATION",
  "animacion 3d": "ANIMATION",
  "animacion 2d": "ANIMATION",
  "vfx": "ANIMATION",
  "efectos visuales": "ANIMATION",

  // ── MODA / ROPA ───────────────────────────────────────────────────────────
  "moda": "APPAREL_FASHION",
  "ropa": "APPAREL_FASHION",
  "fashion": "APPAREL_FASHION",
  "confeccion": "APPAREL_FASHION",
  "confección": "APPAREL_FASHION",
  "indumentaria": "APPAREL_FASHION",
  "vestimenta": "APPAREL_FASHION",
  "prendas de vestir": "APPAREL_FASHION",
  "calzado": "APPAREL_FASHION",
  "accesorios de moda": "APPAREL_FASHION",
  "sector textil moda": "APPAREL_FASHION",

  // ── ARQUITECTURA / PLANIFICACIÓN ──────────────────────────────────────────
  "arquitectura": "ARCHITECTURE_PLANNING",
  "architecture": "ARCHITECTURE_PLANNING",
  "urbanismo": "ARCHITECTURE_PLANNING",
  "planificacion urbana": "ARCHITECTURE_PLANNING",
  "planificación urbana": "ARCHITECTURE_PLANNING",
  "diseño arquitectonico": "ARCHITECTURE_PLANNING",
  "diseño arquitectónico": "ARCHITECTURE_PLANNING",

  // ── ARTES Y MANUALIDADES ──────────────────────────────────────────────────
  "artes y manualidades": "ARTS_AND_CRAFTS",
  "artesania": "ARTS_AND_CRAFTS",
  "artesanía": "ARTS_AND_CRAFTS",
  "crafts": "ARTS_AND_CRAFTS",
  "bellas artes": "ARTS_AND_CRAFTS",

  // ── AUTOMOCIÓN ────────────────────────────────────────────────────────────
  "automocion": "AUTOMOTIVE",
  "automoción": "AUTOMOTIVE",
  "automotive": "AUTOMOTIVE",
  "automovil": "AUTOMOTIVE",
  "automóvil": "AUTOMOTIVE",
  "vehiculos": "AUTOMOTIVE",
  "vehículos": "AUTOMOTIVE",
  "concesionario": "AUTOMOTIVE",
  "recambios": "AUTOMOTIVE",
  "repuestos": "AUTOMOTIVE",
  "talleres mecanicos": "AUTOMOTIVE",
  "talleres mecánicos": "AUTOMOTIVE",
  "sector del automovil": "AUTOMOTIVE",
  "sector del automóvil": "AUTOMOTIVE",

  // ── AERONÁUTICA / ESPACIO ─────────────────────────────────────────────────
  "aeronautica": "AVIATION_AEROSPACE",
  "aeronáutica": "AVIATION_AEROSPACE",
  "aerospace": "AVIATION_AEROSPACE",
  "espacio": "AVIATION_AEROSPACE",
  "sector espacial": "AVIATION_AEROSPACE",
  "defensa aeronautica": "AVIATION_AEROSPACE",

  // ── BANCA ─────────────────────────────────────────────────────────────────
  "banca": "BANKING",
  "banking": "BANKING",
  "banco": "BANKING",
  "entidad bancaria": "BANKING",
  "entidad financiera bancaria": "BANKING",
  "banca minorista": "BANKING",
  "banca corporativa": "BANKING",
  "banca privada": "BANKING",

  // ── BIOTECNOLOGÍA ─────────────────────────────────────────────────────────
  "biotecnologia": "BIOTECHNOLOGY",
  "biotecnología": "BIOTECHNOLOGY",
  "biotech": "BIOTECHNOLOGY",
  "biologia molecular": "BIOTECHNOLOGY",
  "biología molecular": "BIOTECHNOLOGY",
  "genomica": "BIOTECHNOLOGY",
  "genómica": "BIOTECHNOLOGY",

  // ── MEDIOS DE COMUNICACIÓN / TV / RADIO ──────────────────────────────────
  "medios de comunicacion": "BROADCAST_MEDIA",
  "medios de comunicación": "BROADCAST_MEDIA",
  "television": "BROADCAST_MEDIA",
  "televisión": "BROADCAST_MEDIA",
  "radio": "BROADCAST_MEDIA",
  "broadcast": "BROADCAST_MEDIA",
  "radiodifusion": "BROADCAST_MEDIA",
  "radiodifusión": "BROADCAST_MEDIA",
  "medios audiovisuales": "BROADCAST_MEDIA",

  // ── MATERIALES DE CONSTRUCCIÓN ────────────────────────────────────────────
  "materiales de construccion": "BUILDING_MATERIALS",
  "materiales de construcción": "BUILDING_MATERIALS",
  "building materials": "BUILDING_MATERIALS",
  "cemento": "BUILDING_MATERIALS",
  "ladrillos": "BUILDING_MATERIALS",
  "tejas": "BUILDING_MATERIALS",
  "prefabricados": "BUILDING_MATERIALS",

  // ── SUMINISTROS DE OFICINA / EQUIPOS ──────────────────────────────────────
  "suministros de oficina": "BUSINESS_SUPPLIES_AND_EQUIPMENT",
  "equipamiento de oficina": "BUSINESS_SUPPLIES_AND_EQUIPMENT",
  "material de oficina": "BUSINESS_SUPPLIES_AND_EQUIPMENT",
  "maquinaria de oficina": "BUSINESS_SUPPLIES_AND_EQUIPMENT",

  // ── MERCADOS DE CAPITALES ─────────────────────────────────────────────────
  "mercados de capitales": "CAPITAL_MARKETS",
  "capital markets": "CAPITAL_MARKETS",
  "bolsa": "CAPITAL_MARKETS",
  "valores": "CAPITAL_MARKETS",
  "mercado bursatil": "CAPITAL_MARKETS",
  "mercado bursátil": "CAPITAL_MARKETS",

  // ── QUÍMICA ───────────────────────────────────────────────────────────────
  "quimica": "CHEMICALS",
  "química": "CHEMICALS",
  "chemicals": "CHEMICALS",
  "industria quimica": "CHEMICALS",
  "industria química": "CHEMICALS",
  "productos quimicos": "CHEMICALS",
  "productos químicos": "CHEMICALS",
  "petroquimica": "CHEMICALS",
  "petroquímica": "CHEMICALS",
  "agroquimica": "CHEMICALS",
  "agroquímica": "CHEMICALS",
  "quimica industrial": "CHEMICALS",
  "química industrial": "CHEMICALS",
  "fertilizantes": "CHEMICALS",

  // ── ORGANIZACIONES CÍVICAS ────────────────────────────────────────────────
  "organizaciones civicas": "CIVIC_SOCIAL_ORGANIZATION",
  "organizaciones cívicas": "CIVIC_SOCIAL_ORGANIZATION",
  "asociaciones": "CIVIC_SOCIAL_ORGANIZATION",
  "ong": "CIVIC_SOCIAL_ORGANIZATION",
  "organizacion sin animo de lucro": "CIVIC_SOCIAL_ORGANIZATION",

  // ── INGENIERÍA CIVIL ──────────────────────────────────────────────────────
  "ingenieria civil": "CIVIL_ENGINEERING",
  "ingeniería civil": "CIVIL_ENGINEERING",
  "civil engineering": "CIVIL_ENGINEERING",
  "infraestructuras": "CIVIL_ENGINEERING",
  "obra civil": "CIVIL_ENGINEERING",
  "obras publicas": "CIVIL_ENGINEERING",
  "obras públicas": "CIVIL_ENGINEERING",
  "carreteras": "CIVIL_ENGINEERING",
  "puentes": "CIVIL_ENGINEERING",

  // ── INMOBILIARIO COMERCIAL ────────────────────────────────────────────────
  "inmobiliario comercial": "COMMERCIAL_REAL_ESTATE",
  "commercial real estate": "COMMERCIAL_REAL_ESTATE",
  "inmuebles comerciales": "COMMERCIAL_REAL_ESTATE",
  "naves industriales": "COMMERCIAL_REAL_ESTATE",
  "oficinas en alquiler": "COMMERCIAL_REAL_ESTATE",

  // ── SEGURIDAD INFORMÁTICA ─────────────────────────────────────────────────
  "seguridad informatica": "COMPUTER_NETWORK_SECURITY",
  "seguridad informática": "COMPUTER_NETWORK_SECURITY",
  "ciberseguridad": "COMPUTER_NETWORK_SECURITY",
  "cybersecurity": "COMPUTER_NETWORK_SECURITY",
  "network security": "COMPUTER_NETWORK_SECURITY",
  "seguridad de redes": "COMPUTER_NETWORK_SECURITY",
  "hacking etico": "COMPUTER_NETWORK_SECURITY",

  // ── VIDEOJUEGOS / JUEGOS ──────────────────────────────────────────────────
  "videojuegos": "COMPUTER_GAMES",
  "juegos": "COMPUTER_GAMES",
  "gaming": "COMPUTER_GAMES",
  "game development": "COMPUTER_GAMES",
  "desarrollo de videojuegos": "COMPUTER_GAMES",

  // ── HARDWARE ──────────────────────────────────────────────────────────────
  "hardware": "COMPUTER_HARDWARE",
  "computer hardware": "COMPUTER_HARDWARE",
  "fabricacion de hardware": "COMPUTER_HARDWARE",
  "componentes informaticos": "COMPUTER_HARDWARE",
  "componentes informáticos": "COMPUTER_HARDWARE",
  "perifericos": "COMPUTER_HARDWARE",
  "periféricos": "COMPUTER_HARDWARE",
  "servidores": "COMPUTER_HARDWARE",

  // ── REDES INFORMÁTICAS ────────────────────────────────────────────────────
  "redes informaticas": "COMPUTER_NETWORKING",
  "redes informáticas": "COMPUTER_NETWORKING",
  "networking": "COMPUTER_NETWORKING",
  "redes": "COMPUTER_NETWORKING",
  "telecomunicaciones de red": "COMPUTER_NETWORKING",

  // ── SOFTWARE ──────────────────────────────────────────────────────────────
  "software": "COMPUTER_SOFTWARE",
  "computer software": "COMPUTER_SOFTWARE",
  "desarrollo de software": "COMPUTER_SOFTWARE",
  "saas": "COMPUTER_SOFTWARE",
  "aplicaciones": "COMPUTER_SOFTWARE",
  "programacion": "COMPUTER_SOFTWARE",
  "programación": "COMPUTER_SOFTWARE",
  "desarrollo web": "COMPUTER_SOFTWARE",
  "erp": "COMPUTER_SOFTWARE",
  "crm software": "COMPUTER_SOFTWARE",

  // ── INTERNET ──────────────────────────────────────────────────────────────
  "internet": "INTERNET",
  "ecommerce": "INTERNET",
  "e-commerce": "INTERNET",
  "comercio electronico": "INTERNET",
  "comercio electrónico": "INTERNET",
  "marketplace": "INTERNET",
  "startup digital": "INTERNET",
  "plataforma digital": "INTERNET",

  // ── CONSTRUCCIÓN ─────────────────────────────────────────────────────────
  "construccion": "CONSTRUCTION",
  "construcción": "CONSTRUCTION",
  "construction": "CONSTRUCTION",
  "promotora": "CONSTRUCTION",
  "promotoras inmobiliarias": "CONSTRUCTION",
  "obras": "CONSTRUCTION",
  "edificacion": "CONSTRUCTION",
  "edificación": "CONSTRUCTION",
  "contratista": "CONSTRUCTION",
  "instalaciones": "CONSTRUCTION",
  "rehabilitacion": "CONSTRUCTION",
  "rehabilitación": "CONSTRUCTION",

  // ── ELECTRÓNICA DE CONSUMO ────────────────────────────────────────────────
  "electronica de consumo": "CONSUMER_ELECTRONICS",
  "electrónica de consumo": "CONSUMER_ELECTRONICS",
  "consumer electronics": "CONSUMER_ELECTRONICS",
  "electrodomesticos": "CONSUMER_ELECTRONICS",
  "electrodomésticos": "CONSUMER_ELECTRONICS",
  "dispositivos electronicos": "CONSUMER_ELECTRONICS",
  "dispositivos electrónicos": "CONSUMER_ELECTRONICS",

  // ── BIENES DE CONSUMO ─────────────────────────────────────────────────────
  "bienes de consumo": "CONSUMER_GOODS",
  "consumer goods": "CONSUMER_GOODS",
  "fmcg": "CONSUMER_GOODS",
  "gran consumo": "CONSUMER_GOODS",
  "productos de consumo": "CONSUMER_GOODS",

  // ── SERVICIOS AL CONSUMIDOR ───────────────────────────────────────────────
  "servicios al consumidor": "CONSUMER_SERVICES",
  "consumer services": "CONSUMER_SERVICES",
  "servicios personales": "CONSUMER_SERVICES",
  "atencion al cliente": "CONSUMER_SERVICES",
  "atención al cliente": "CONSUMER_SERVICES",

  // ── COSMÉTICA ─────────────────────────────────────────────────────────────
  "cosmetica": "COSMETICS",
  "cosmética": "COSMETICS",
  "cosmetics": "COSMETICS",
  "belleza": "COSMETICS",
  "perfumeria": "COSMETICS",
  "perfumería": "COSMETICS",
  "higiene personal": "COSMETICS",
  "productos de belleza": "COSMETICS",
  "cuidado personal": "COSMETICS",

  // ── LÁCTEOS ───────────────────────────────────────────────────────────────
  "lacteos": "DAIRY",
  "lácteos": "DAIRY",
  "dairy": "DAIRY",
  "productos lacteos": "DAIRY",
  "leche": "DAIRY",
  "quesos": "DAIRY",

  // ── DEFENSA / ESPACIO ─────────────────────────────────────────────────────
  "defensa": "DEFENSE_SPACE",
  "defense": "DEFENSE_SPACE",
  "industria de defensa": "DEFENSE_SPACE",
  "armamento": "DEFENSE_SPACE",
  "sector defensa": "DEFENSE_SPACE",
  "tecnologia militar": "DEFENSE_SPACE",
  "tecnología militar": "DEFENSE_SPACE",

  // ── DISEÑO ────────────────────────────────────────────────────────────────
  "diseño": "DESIGN",
  "diseno": "DESIGN",
  "design": "DESIGN",
  "diseño industrial": "DESIGN",
  "diseño de producto": "DESIGN",
  "diseño de interiores": "DESIGN",
  "diseño ux": "DESIGN",
  "ux/ui": "DESIGN",
  "ui design": "DESIGN",

  // ── GESTIÓN EDUCATIVA ─────────────────────────────────────────────────────
  "gestion educativa": "EDUCATION_MANAGEMENT",
  "gestión educativa": "EDUCATION_MANAGEMENT",
  "education management": "EDUCATION_MANAGEMENT",
  "administracion educativa": "EDUCATION_MANAGEMENT",
  "administración educativa": "EDUCATION_MANAGEMENT",

  // ── E-LEARNING ────────────────────────────────────────────────────────────
  "e-learning": "E_LEARNING",
  "elearning": "E_LEARNING",
  "formacion online": "E_LEARNING",
  "formación online": "E_LEARNING",
  "educacion en linea": "E_LEARNING",
  "educación en línea": "E_LEARNING",
  "lms": "E_LEARNING",
  "plataforma educativa": "E_LEARNING",

  // ── FABRICACIÓN ELECTRÓNICA ───────────────────────────────────────────────
  "fabricacion electronica": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "fabricación electrónica": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "electronica": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "electrónica": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "componentes electronicos": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "componentes electrónicos": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "manufactura electronica": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "manufactura electrónica": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "fabricacion": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "fabricación": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "manufactura": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "industria manufacturera": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "fabricacion industrial": "ELECTRICAL_ELECTRONIC_MANUFACTURING",
  "fabricación industrial": "ELECTRICAL_ELECTRONIC_MANUFACTURING",

  // ── ENTRETENIMIENTO ───────────────────────────────────────────────────────
  "entretenimiento": "ENTERTAINMENT",
  "entertainment": "ENTERTAINMENT",
  "ocio": "ENTERTAINMENT",
  "industria del entretenimiento": "ENTERTAINMENT",

  // ── SERVICIOS MEDIOAMBIENTALES ────────────────────────────────────────────
  "servicios medioambientales": "ENVIRONMENTAL_SERVICES",
  "medio ambiente": "ENVIRONMENTAL_SERVICES",
  "medioambiente": "ENVIRONMENTAL_SERVICES",
  "environmental services": "ENVIRONMENTAL_SERVICES",
  "gestion de residuos": "ENVIRONMENTAL_SERVICES",
  "gestión de residuos": "ENVIRONMENTAL_SERVICES",
  "reciclaje": "ENVIRONMENTAL_SERVICES",
  "tratamiento de aguas": "ENVIRONMENTAL_SERVICES",
  "depuracion": "ENVIRONMENTAL_SERVICES",
  "depuración": "ENVIRONMENTAL_SERVICES",
  "consultoria ambiental": "ENVIRONMENTAL_SERVICES",

  // ── ORGANIZACIÓN DE EVENTOS ───────────────────────────────────────────────
  "eventos": "EVENTS_SERVICES",
  "organizacion de eventos": "EVENTS_SERVICES",
  "organización de eventos": "EVENTS_SERVICES",
  "events": "EVENTS_SERVICES",
  "congresos": "EVENTS_SERVICES",
  "ferias": "EVENTS_SERVICES",
  "catering": "EVENTS_SERVICES",

  // ── DIRECCIÓN EJECUTIVA ───────────────────────────────────────────────────
  "direccion ejecutiva": "EXECUTIVE_OFFICE",
  "dirección ejecutiva": "EXECUTIVE_OFFICE",
  "alta direccion": "EXECUTIVE_OFFICE",
  "alta dirección": "EXECUTIVE_OFFICE",
  "c-suite": "EXECUTIVE_OFFICE",

  // ── SERVICIOS DE INSTALACIONES ────────────────────────────────────────────
  "servicios de instalaciones": "FACILITIES_SERVICES",
  "facility management": "FACILITIES_SERVICES",
  "mantenimiento de instalaciones": "FACILITIES_SERVICES",
  "limpieza industrial": "FACILITIES_SERVICES",
  "servicios generales": "FACILITIES_SERVICES",

  // ── AGRICULTURA ───────────────────────────────────────────────────────────
  "agricultura": "FARMING",
  "farming": "FARMING",
  "agro": "FARMING",
  "agroalimentario": "FARMING",
  "agroalimentaria": "FARMING",
  "campo": "FARMING",
  "produccion agricola": "FARMING",
  "producción agrícola": "FARMING",
  "sector agrario": "FARMING",
  "agroindustria": "FARMING",
  "horticultura": "FARMING",
  "viticultura": "FARMING",
  "olivar": "FARMING",

  // ── SERVICIOS FINANCIEROS ─────────────────────────────────────────────────
  "servicios financieros": "FINANCIAL_SERVICES",
  "financial services": "FINANCIAL_SERVICES",
  "finanzas": "FINANCIAL_SERVICES",
  "finance": "FINANCIAL_SERVICES",
  "fintech": "FINANCIAL_SERVICES",
  "entidad financiera": "FINANCIAL_SERVICES",
  "asesoria financiera": "FINANCIAL_SERVICES",
  "asesoría financiera": "FINANCIAL_SERVICES",
  "gestion de patrimonio": "FINANCIAL_SERVICES",
  "gestión de patrimonio": "FINANCIAL_SERVICES",
  "pagos digitales": "FINANCIAL_SERVICES",
  "medios de pago": "FINANCIAL_SERVICES",

  // ── BELLAS ARTES ──────────────────────────────────────────────────────────
  "bellas artes fine art": "FINE_ART",
  "arte": "FINE_ART",
  "galeria de arte": "FINE_ART",
  "galería de arte": "FINE_ART",
  "pintura": "FINE_ART",
  "escultura": "FINE_ART",
  "mercado del arte": "FINE_ART",

  // ── PESCA ─────────────────────────────────────────────────────────────────
  "pesca": "FISHERY",
  "fishery": "FISHERY",
  "acuicultura": "FISHERY",
  "sector pesquero": "FISHERY",
  "marisqueo": "FISHERY",

  // ── ALIMENTACIÓN Y BEBIDAS ────────────────────────────────────────────────
  "alimentacion": "FOOD_BEVERAGES",
  "alimentación": "FOOD_BEVERAGES",
  "bebidas": "FOOD_BEVERAGES",
  "food and beverage": "FOOD_BEVERAGES",
  "food & beverage": "FOOD_BEVERAGES",
  "industria alimentaria": "FOOD_BEVERAGES",
  "sector alimentario": "FOOD_BEVERAGES",
  "hosteleria": "FOOD_BEVERAGES",
  "hostelería": "FOOD_BEVERAGES",
  "cafeteria": "FOOD_BEVERAGES",
  "bar": "FOOD_BEVERAGES",
  "bebidas alcoholicas": "FOOD_BEVERAGES",
  "bebidas alcohólicas": "FOOD_BEVERAGES",
  "refrescos": "FOOD_BEVERAGES",
  "zumos": "FOOD_BEVERAGES",

  // ── PRODUCCIÓN ALIMENTARIA ────────────────────────────────────────────────
  "produccion alimentaria": "FOOD_PRODUCTION",
  "producción alimentaria": "FOOD_PRODUCTION",
  "food production": "FOOD_PRODUCTION",
  "procesado de alimentos": "FOOD_PRODUCTION",
  "conservas": "FOOD_PRODUCTION",
  "embutidos": "FOOD_PRODUCTION",
  "panaderia": "FOOD_PRODUCTION",
  "panadería": "FOOD_PRODUCTION",
  "pasteleria": "FOOD_PRODUCTION",
  "pastelería": "FOOD_PRODUCTION",

  // ── CAPTACIÓN DE FONDOS ───────────────────────────────────────────────────
  "captacion de fondos": "FUND_RAISING",
  "captación de fondos": "FUND_RAISING",
  "fundraising": "FUND_RAISING",
  "recaudacion de fondos": "FUND_RAISING",
  "recaudación de fondos": "FUND_RAISING",

  // ── MOBILIARIO ────────────────────────────────────────────────────────────
  "mobiliario": "FURNITURE",
  "muebles": "FURNITURE",
  "furniture": "FURNITURE",
  "industria del mueble": "FURNITURE",
  "decoracion del hogar": "FURNITURE",
  "decoración del hogar": "FURNITURE",

  // ── JUEGO / CASINOS ───────────────────────────────────────────────────────
  "juego": "GAMBLING_CASINOS",
  "casinos": "GAMBLING_CASINOS",
  "gambling": "GAMBLING_CASINOS",
  "juego online": "GAMBLING_CASINOS",
  "apuestas": "GAMBLING_CASINOS",
  "loterías": "GAMBLING_CASINOS",
  "loterias": "GAMBLING_CASINOS",

  // ── VIDRIO / CERÁMICA / HORMIGÓN ──────────────────────────────────────────
  "vidrio": "GLASS_CERAMICS_CONCRETE",
  "ceramica": "GLASS_CERAMICS_CONCRETE",
  "cerámica": "GLASS_CERAMICS_CONCRETE",
  "hormigon": "GLASS_CERAMICS_CONCRETE",
  "hormigón": "GLASS_CERAMICS_CONCRETE",
  "ceramica industrial": "GLASS_CERAMICS_CONCRETE",
  "cerámica industrial": "GLASS_CERAMICS_CONCRETE",
  "materiales ceramicos": "GLASS_CERAMICS_CONCRETE",
  "materiales cerámicos": "GLASS_CERAMICS_CONCRETE",
  "azulejos": "GLASS_CERAMICS_CONCRETE",
  "pavimentos ceramicos": "GLASS_CERAMICS_CONCRETE",
  "pavimentos cerámicos": "GLASS_CERAMICS_CONCRETE",

  // ── ADMINISTRACIÓN PÚBLICA ────────────────────────────────────────────────
  "administracion publica": "GOVERNMENT_ADMINISTRATION",
  "administración pública": "GOVERNMENT_ADMINISTRATION",
  "gobierno": "GOVERNMENT_ADMINISTRATION",
  "sector publico": "GOVERNMENT_ADMINISTRATION",
  "sector público": "GOVERNMENT_ADMINISTRATION",
  "ayuntamiento": "GOVERNMENT_ADMINISTRATION",
  "administracion local": "GOVERNMENT_ADMINISTRATION",
  "administración local": "GOVERNMENT_ADMINISTRATION",
  "gobierno regional": "GOVERNMENT_ADMINISTRATION",
  "diputacion": "GOVERNMENT_ADMINISTRATION",
  "diputación": "GOVERNMENT_ADMINISTRATION",

  // ── RELACIONES GUBERNAMENTALES ────────────────────────────────────────────
  "relaciones gubernamentales": "GOVERNMENT_RELATIONS",
  "lobby": "GOVERNMENT_RELATIONS",
  "asuntos publicos": "GOVERNMENT_RELATIONS",
  "asuntos públicos": "GOVERNMENT_RELATIONS",

  // ── DISEÑO GRÁFICO ────────────────────────────────────────────────────────
  "diseño grafico": "GRAPHIC_DESIGN",
  "diseno grafico": "GRAPHIC_DESIGN",
  "graphic design": "GRAPHIC_DESIGN",
  "identidad corporativa": "GRAPHIC_DESIGN",
  "branding": "GRAPHIC_DESIGN",
  "agencia creativa": "GRAPHIC_DESIGN",

  // ── SALUD Y BIENESTAR ─────────────────────────────────────────────────────
  "salud y bienestar": "HEALTH_WELLNESS_AND_FITNESS",
  "wellness": "HEALTH_WELLNESS_AND_FITNESS",
  "fitness": "HEALTH_WELLNESS_AND_FITNESS",
  "gimnasio": "HEALTH_WELLNESS_AND_FITNESS",
  "nutricion": "HEALTH_WELLNESS_AND_FITNESS",
  "nutrición": "HEALTH_WELLNESS_AND_FITNESS",
  "deporte": "HEALTH_WELLNESS_AND_FITNESS",
  "salud": "HEALTH_WELLNESS_AND_FITNESS",
  "bienestar": "HEALTH_WELLNESS_AND_FITNESS",
  "spa": "HEALTH_WELLNESS_AND_FITNESS",
  "yoga": "HEALTH_WELLNESS_AND_FITNESS",

  // ── EDUCACIÓN SUPERIOR ────────────────────────────────────────────────────
  "educacion superior": "HIGHER_EDUCATION",
  "educación superior": "HIGHER_EDUCATION",
  "universidad": "HIGHER_EDUCATION",
  "universidades": "HIGHER_EDUCATION",
  "higher education": "HIGHER_EDUCATION",
  "facultad": "HIGHER_EDUCATION",
  "escuela de negocios": "HIGHER_EDUCATION",
  "escuelas de negocio": "HIGHER_EDUCATION",
  "formacion universitaria": "HIGHER_EDUCATION",

  // ── SANIDAD / HOSPITALES ──────────────────────────────────────────────────
  "sanidad": "HOSPITAL_HEALTH_CARE",
  "salud publica": "HOSPITAL_HEALTH_CARE",
  "salud pública": "HOSPITAL_HEALTH_CARE",
  "hospital": "HOSPITAL_HEALTH_CARE",
  "hospitales": "HOSPITAL_HEALTH_CARE",
  "clinica": "HOSPITAL_HEALTH_CARE",
  "clínica": "HOSPITAL_HEALTH_CARE",
  "healthcare": "HOSPITAL_HEALTH_CARE",
  "sector sanitario": "HOSPITAL_HEALTH_CARE",
  "atencion sanitaria": "HOSPITAL_HEALTH_CARE",
  "atención sanitaria": "HOSPITAL_HEALTH_CARE",
  "medicina": "HOSPITAL_HEALTH_CARE",
  "centros de salud": "HOSPITAL_HEALTH_CARE",
  "urgencias": "HOSPITAL_HEALTH_CARE",

  // ── HOSTELERÍA ────────────────────────────────────────────────────────────
  "hotel": "HOSPITALITY",
  "hoteles": "HOSPITALITY",
  "alojamiento": "HOSPITALITY",
  "turismo hotelero": "HOSPITALITY",
  "hospitality": "HOSPITALITY",
  "sector hotelero": "HOSPITALITY",
  "cadena hotelera": "HOSPITALITY",
  "alojamiento turistico": "HOSPITALITY",
  "alojamiento turístico": "HOSPITALITY",

  // ── RECURSOS HUMANOS ──────────────────────────────────────────────────────
  "recursos humanos": "HUMAN_RESOURCES",
  "human resources": "HUMAN_RESOURCES",
  "hr": "HUMAN_RESOURCES",
  "rrhh": "HUMAN_RESOURCES",
  "gestion de personas": "HUMAN_RESOURCES",
  "gestión de personas": "HUMAN_RESOURCES",
  "talent management": "HUMAN_RESOURCES",
  "nominas": "HUMAN_RESOURCES",
  "nóminas": "HUMAN_RESOURCES",

  // ── IMPORTACIÓN Y EXPORTACIÓN ─────────────────────────────────────────────
  "importacion": "IMPORT_AND_EXPORT",
  "importación": "IMPORT_AND_EXPORT",
  "exportacion": "IMPORT_AND_EXPORT",
  "exportación": "IMPORT_AND_EXPORT",
  "comercio exterior": "IMPORT_AND_EXPORT",
  "comercio internacional": "IMPORT_AND_EXPORT",
  "import export": "IMPORT_AND_EXPORT",

  // ── SERVICIOS SOCIALES ────────────────────────────────────────────────────
  "servicios sociales": "INDIVIDUAL_FAMILY_SERVICES",
  "asistencia social": "INDIVIDUAL_FAMILY_SERVICES",
  "trabajo social": "INDIVIDUAL_FAMILY_SERVICES",
  "atencion a la dependencia": "INDIVIDUAL_FAMILY_SERVICES",
  "atención a la dependencia": "INDIVIDUAL_FAMILY_SERVICES",
  "cuidado de mayores": "INDIVIDUAL_FAMILY_SERVICES",
  "residencias": "INDIVIDUAL_FAMILY_SERVICES",

  // ── AUTOMATIZACIÓN INDUSTRIAL ─────────────────────────────────────────────
  "automatizacion industrial": "INDUSTRIAL_AUTOMATION",
  "automatización industrial": "INDUSTRIAL_AUTOMATION",
  "industrial automation": "INDUSTRIAL_AUTOMATION",
  "robotica": "INDUSTRIAL_AUTOMATION",
  "robótica": "INDUSTRIAL_AUTOMATION",
  "robotics": "INDUSTRIAL_AUTOMATION",
  "sistemas de control": "INDUSTRIAL_AUTOMATION",
  "plc": "INDUSTRIAL_AUTOMATION",
  "scada": "INDUSTRIAL_AUTOMATION",
  "automatizacion": "INDUSTRIAL_AUTOMATION",
  "automatización": "INDUSTRIAL_AUTOMATION",
  "control industrial": "INDUSTRIAL_AUTOMATION",

  // ── SERVICIOS DE INFORMACIÓN ──────────────────────────────────────────────
  "servicios de informacion": "INFORMATION_SERVICES",
  "servicios de información": "INFORMATION_SERVICES",
  "information services": "INFORMATION_SERVICES",
  "gestion documental": "INFORMATION_SERVICES",
  "gestión documental": "INFORMATION_SERVICES",
  "bases de datos": "INFORMATION_SERVICES",
  "analisis de datos": "INFORMATION_SERVICES",
  "análisis de datos": "INFORMATION_SERVICES",
  "big data": "INFORMATION_SERVICES",

  // ── TECNOLOGÍA DE LA INFORMACIÓN ──────────────────────────────────────────
  "tecnologia de la informacion": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "tecnología de la información": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "it": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "tic": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "tecnologia": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "tecnología": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "informatica": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "informática": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "consultoria tecnologica": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "consultoría tecnológica": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "it services": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "outsourcing it": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "integracion de sistemas": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "integración de sistemas": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "cloud computing": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "computacion en la nube": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "computación en la nube": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "inteligencia artificial": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "ia": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "machine learning": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "data science": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "ciencia de datos": "INFORMATION_TECHNOLOGY_AND_SERVICES",
  "devops": "INFORMATION_TECHNOLOGY_AND_SERVICES",

  // ── SEGUROS ───────────────────────────────────────────────────────────────
  "seguros": "INSURANCE",
  "insurance": "INSURANCE",
  "aseguradora": "INSURANCE",
  "correduria de seguros": "INSURANCE",
  "correduría de seguros": "INSURANCE",
  "mediacion de seguros": "INSURANCE",
  "mediación de seguros": "INSURANCE",
  "mutua": "INSURANCE",

  // ── ASUNTOS INTERNACIONALES ───────────────────────────────────────────────
  "asuntos internacionales": "INTERNATIONAL_AFFAIRS",
  "relaciones internacionales": "INTERNATIONAL_AFFAIRS",
  "diplomacia": "INTERNATIONAL_AFFAIRS",
  "organizaciones internacionales": "INTERNATIONAL_AFFAIRS",

  // ── COMERCIO Y DESARROLLO INTERNACIONAL ──────────────────────────────────
  "desarrollo internacional": "INTERNATIONAL_TRADE_AND_DEVELOPMENT",
  "cooperacion internacional": "INTERNATIONAL_TRADE_AND_DEVELOPMENT",
  "cooperación internacional": "INTERNATIONAL_TRADE_AND_DEVELOPMENT",

  // ── BANCA DE INVERSIÓN ────────────────────────────────────────────────────
  "banca de inversion": "INVESTMENT_BANKING",
  "banca de inversión": "INVESTMENT_BANKING",
  "investment banking": "INVESTMENT_BANKING",
  "banco de inversion": "INVESTMENT_BANKING",
  "banco de inversión": "INVESTMENT_BANKING",
  "m&a": "INVESTMENT_BANKING",
  "fusiones y adquisiciones": "INVESTMENT_BANKING",

  // ── GESTIÓN DE INVERSIONES ────────────────────────────────────────────────
  "gestion de inversiones": "INVESTMENT_MANAGEMENT",
  "gestión de inversiones": "INVESTMENT_MANAGEMENT",
  "investment management": "INVESTMENT_MANAGEMENT",
  "fondos de inversion": "INVESTMENT_MANAGEMENT",
  "fondos de inversión": "INVESTMENT_MANAGEMENT",
  "hedge funds": "INVESTMENT_MANAGEMENT",
  "asset management": "INVESTMENT_MANAGEMENT",

  // ── PODER JUDICIAL ────────────────────────────────────────────────────────
  "poder judicial": "JUDICIARY",
  "juzgados": "JUDICIARY",
  "tribunales": "JUDICIARY",
  "justicia": "JUDICIARY",

  // ── SEGURIDAD / POLICÍA ───────────────────────────────────────────────────
  "policia": "LAW_ENFORCEMENT",
  "policía": "LAW_ENFORCEMENT",
  "law enforcement": "LAW_ENFORCEMENT",
  "seguridad publica": "LAW_ENFORCEMENT",
  "seguridad pública": "LAW_ENFORCEMENT",
  "guardia civil": "LAW_ENFORCEMENT",

  // ── EJERCICIO DE LA ABOGACÍA ──────────────────────────────────────────────
  "abogacia": "LAW_PRACTICE",
  "abogacía": "LAW_PRACTICE",
  "law practice": "LAW_PRACTICE",
  "despacho de abogados": "LAW_PRACTICE",
  "bufete": "LAW_PRACTICE",
  "abogados": "LAW_PRACTICE",

  // ── SERVICIOS JURÍDICOS ───────────────────────────────────────────────────
  "servicios juridicos": "LEGAL_SERVICES",
  "servicios jurídicos": "LEGAL_SERVICES",
  "legal services": "LEGAL_SERVICES",
  "legal": "LEGAL_SERVICES",
  "notaria": "LEGAL_SERVICES",
  "notaría": "LEGAL_SERVICES",
  "registro": "LEGAL_SERVICES",
  "procuradores": "LEGAL_SERVICES",

  // ── LEGISLATIVO ───────────────────────────────────────────────────────────
  "legislativo": "LEGISLATIVE_OFFICE",
  "parlamento": "LEGISLATIVE_OFFICE",
  "congreso": "LEGISLATIVE_OFFICE",
  "senado": "LEGISLATIVE_OFFICE",

  // ── TURISMO Y VIAJES ──────────────────────────────────────────────────────
  "turismo": "LEISURE_TRAVEL_TOURISM",
  "viajes": "LEISURE_TRAVEL_TOURISM",
  "travel": "LEISURE_TRAVEL_TOURISM",
  "agencia de viajes": "LEISURE_TRAVEL_TOURISM",
  "sector turistico": "LEISURE_TRAVEL_TOURISM",
  "sector turístico": "LEISURE_TRAVEL_TOURISM",
  "tour operador": "LEISURE_TRAVEL_TOURISM",
  "cruceros": "LEISURE_TRAVEL_TOURISM",
  "turismo rural": "LEISURE_TRAVEL_TOURISM",

  // ── BIBLIOTECAS ───────────────────────────────────────────────────────────
  "bibliotecas": "LIBRARIES",
  "biblioteca": "LIBRARIES",
  "archivos": "LIBRARIES",

  // ── LOGÍSTICA Y CADENA DE SUMINISTRO ─────────────────────────────────────
  "logistica": "LOGISTICS_AND_SUPPLY_CHAIN",
  "logística": "LOGISTICS_AND_SUPPLY_CHAIN",
  "logistics": "LOGISTICS_AND_SUPPLY_CHAIN",
  "cadena de suministro": "LOGISTICS_AND_SUPPLY_CHAIN",
  "supply chain": "LOGISTICS_AND_SUPPLY_CHAIN",
  "distribucion": "LOGISTICS_AND_SUPPLY_CHAIN",
  "distribución": "LOGISTICS_AND_SUPPLY_CHAIN",
  "almacenamiento y distribucion": "LOGISTICS_AND_SUPPLY_CHAIN",
  "almacenamiento y distribución": "LOGISTICS_AND_SUPPLY_CHAIN",
  "mensajeria": "LOGISTICS_AND_SUPPLY_CHAIN",
  "mensajería": "LOGISTICS_AND_SUPPLY_CHAIN",
  "courier": "LOGISTICS_AND_SUPPLY_CHAIN",

  // ── ARTÍCULOS DE LUJO ─────────────────────────────────────────────────────
  "lujo": "LUXURY_GOODS_JEWELRY",
  "joyeria": "LUXURY_GOODS_JEWELRY",
  "joyería": "LUXURY_GOODS_JEWELRY",
  "luxury": "LUXURY_GOODS_JEWELRY",
  "articulos de lujo": "LUXURY_GOODS_JEWELRY",
  "artículos de lujo": "LUXURY_GOODS_JEWELRY",
  "relojeria": "LUXURY_GOODS_JEWELRY",
  "relojería": "LUXURY_GOODS_JEWELRY",

  // ── MAQUINARIA ────────────────────────────────────────────────────────────
  "maquinaria": "MACHINERY",
  "machinery": "MACHINERY",
  "equipos industriales": "MACHINERY",
  "maquinaria industrial": "MACHINERY",
  "maquinaria agricola": "MACHINERY",
  "maquinaria agrícola": "MACHINERY",
  "maquinaria de construccion": "MACHINERY",
  "maquinaria de construcción": "MACHINERY",
  "equipos de produccion": "MACHINERY",
  "equipos de producción": "MACHINERY",
  "herramientas industriales": "MACHINERY",

  // ── CONSULTORÍA DE GESTIÓN ────────────────────────────────────────────────
  "consultoria de gestion": "MANAGEMENT_CONSULTING",
  "consultoría de gestión": "MANAGEMENT_CONSULTING",
  "consultoria": "MANAGEMENT_CONSULTING",
  "consultoría": "MANAGEMENT_CONSULTING",
  "management consulting": "MANAGEMENT_CONSULTING",
  "consulting": "MANAGEMENT_CONSULTING",
  "asesoria empresarial": "MANAGEMENT_CONSULTING",
  "asesoría empresarial": "MANAGEMENT_CONSULTING",
  "consultoria estrategica": "MANAGEMENT_CONSULTING",
  "consultoría estratégica": "MANAGEMENT_CONSULTING",

  // ── MARÍTIMO ──────────────────────────────────────────────────────────────
  "maritimo": "MARITIME",
  "marítimo": "MARITIME",
  "maritime": "MARITIME",
  "sector maritimo": "MARITIME",
  "naviera": "MARITIME",
  "navieras": "MARITIME",
  "transporte maritimo": "MARITIME",
  "transporte marítimo": "MARITIME",
  "puertos": "MARITIME",

  // ── INVESTIGACIÓN DE MERCADOS ─────────────────────────────────────────────
  "investigacion de mercados": "MARKET_RESEARCH",
  "investigación de mercados": "MARKET_RESEARCH",
  "market research": "MARKET_RESEARCH",
  "estudios de mercado": "MARKET_RESEARCH",
  "analisis de mercado": "MARKET_RESEARCH",
  "análisis de mercado": "MARKET_RESEARCH",

  // ── MARKETING Y PUBLICIDAD ────────────────────────────────────────────────
  "marketing": "MARKETING_AND_ADVERTISING",
  "publicidad": "MARKETING_AND_ADVERTISING",
  "advertising": "MARKETING_AND_ADVERTISING",
  "agencia de marketing": "MARKETING_AND_ADVERTISING",
  "agencia de publicidad": "MARKETING_AND_ADVERTISING",
  "marketing digital": "MARKETING_AND_ADVERTISING",
  "seo": "MARKETING_AND_ADVERTISING",
  "sem": "MARKETING_AND_ADVERTISING",
  "redes sociales": "MARKETING_AND_ADVERTISING",
  "social media": "MARKETING_AND_ADVERTISING",
  "email marketing": "MARKETING_AND_ADVERTISING",
  "growth hacking": "MARKETING_AND_ADVERTISING",
  "comunicacion": "MARKETING_AND_ADVERTISING",
  "comunicación": "MARKETING_AND_ADVERTISING",

  // ── INGENIERÍA MECÁNICA / INDUSTRIAL ─────────────────────────────────────
  "ingenieria mecanica": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "ingeniería mecánica": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "ingenieria industrial": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "ingeniería industrial": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "mechanical engineering": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "industrial engineering": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "metalurgia": "MINING_METALS",   // ← alias que causaba el bug original
  "mecanizado": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "estampacion": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "estampación": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "forja": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "caldereria": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "calderería": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "soldadura": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "tratamientos termicos": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "tratamientos térmicos": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",
  "mantenimiento industrial": "MECHANICAL_OR_INDUSTRIAL_ENGINEERING",

  // ── PRODUCCIÓN MEDIÁTICA ──────────────────────────────────────────────────
  "produccion mediatica": "MEDIA_PRODUCTION",
  "producción mediática": "MEDIA_PRODUCTION",
  "media production": "MEDIA_PRODUCTION",
  "produccion de contenidos": "MEDIA_PRODUCTION",
  "producción de contenidos": "MEDIA_PRODUCTION",
  "productora": "MEDIA_PRODUCTION",
  "estudios de produccion": "MEDIA_PRODUCTION",

  // ── DISPOSITIVOS MÉDICOS ──────────────────────────────────────────────────
  "dispositivos medicos": "MEDICAL_DEVICES",
  "dispositivos médicos": "MEDICAL_DEVICES",
  "medical devices": "MEDICAL_DEVICES",
  "equipamiento medico": "MEDICAL_DEVICES",
  "equipamiento médico": "MEDICAL_DEVICES",
  "instrumental medico": "MEDICAL_DEVICES",
  "instrumental médico": "MEDICAL_DEVICES",
  "diagnostico por imagen": "MEDICAL_DEVICES",
  "diagnóstico por imagen": "MEDICAL_DEVICES",

  // ── PRÁCTICA MÉDICA ───────────────────────────────────────────────────────
  "consulta medica": "MEDICAL_PRACTICE",
  "consulta médica": "MEDICAL_PRACTICE",
  "medico": "MEDICAL_PRACTICE",
  "médico": "MEDICAL_PRACTICE",
  "medical practice": "MEDICAL_PRACTICE",
  "dentista": "MEDICAL_PRACTICE",
  "odontologia": "MEDICAL_PRACTICE",
  "odontología": "MEDICAL_PRACTICE",
  "oftalmologia": "MEDICAL_PRACTICE",
  "oftalmología": "MEDICAL_PRACTICE",
  "fisioterapia": "MEDICAL_PRACTICE",

  // ── SALUD MENTAL ──────────────────────────────────────────────────────────
  "salud mental": "MENTAL_HEALTH_CARE",
  "mental health": "MENTAL_HEALTH_CARE",
  "psicologia": "MENTAL_HEALTH_CARE",
  "psicología": "MENTAL_HEALTH_CARE",
  "psiquiatria": "MENTAL_HEALTH_CARE",
  "psiquiatría": "MENTAL_HEALTH_CARE",
  "terapia psicologica": "MENTAL_HEALTH_CARE",
  "terapia psicológica": "MENTAL_HEALTH_CARE",

  // ── FUERZAS ARMADAS ───────────────────────────────────────────────────────
  "fuerzas armadas": "MILITARY",
  "ejercito": "MILITARY",
  "ejército": "MILITARY",
  "militar": "MILITARY",
  "military": "MILITARY",
  "defensa nacional": "MILITARY",

  // ── MINERÍA / METALES ─────────────────────────────────────────────────────
  "mineria": "MINING_METALS",
  "minería": "MINING_METALS",
  "mining": "MINING_METALS",
  "metales": "MINING_METALS",
  "metals": "MINING_METALS",
  "siderurgia": "MINING_METALS",
  "acero": "MINING_METALS",
  "aluminio": "MINING_METALS",
  "cobre": "MINING_METALS",
  "industria siderurgica": "MINING_METALS",
  "industria siderúrgica": "MINING_METALS",
  "metalurgica": "MINING_METALS",
  "metalúrgica": "MINING_METALS",
  "fundicion": "MINING_METALS",
  "fundición": "MINING_METALS",
  "extraccion de minerales": "MINING_METALS",
  "extracción de minerales": "MINING_METALS",

  // ── CINE ──────────────────────────────────────────────────────────────────
  "cine": "MOTION_PICTURES_AND_FILM",
  "pelicula": "MOTION_PICTURES_AND_FILM",
  "películas": "MOTION_PICTURES_AND_FILM",
  "produccion cinematografica": "MOTION_PICTURES_AND_FILM",
  "producción cinematográfica": "MOTION_PICTURES_AND_FILM",
  "film": "MOTION_PICTURES_AND_FILM",
  "industria del cine": "MOTION_PICTURES_AND_FILM",

  // ── MUSEOS E INSTITUCIONES ────────────────────────────────────────────────
  "museos": "MUSEUMS_AND_INSTITUTIONS",
  "museo": "MUSEUMS_AND_INSTITUTIONS",
  "instituciones culturales": "MUSEUMS_AND_INSTITUTIONS",
  "patrimonio cultural": "MUSEUMS_AND_INSTITUTIONS",
  "fundaciones culturales": "MUSEUMS_AND_INSTITUTIONS",

  // ── MÚSICA ────────────────────────────────────────────────────────────────
  "musica": "MUSIC",
  "música": "MUSIC",
  "music": "MUSIC",
  "industria musical": "MUSIC",
  "discografica": "MUSIC",
  "discográfica": "MUSIC",
  "entretenimiento musical": "MUSIC",

  // ── NANOTECNOLOGÍA ────────────────────────────────────────────────────────
  "nanotecnologia": "NANOTECHNOLOGY",
  "nanotecnología": "NANOTECHNOLOGY",
  "nanotechnology": "NANOTECHNOLOGY",

  // ── PRENSA / PERIÓDICOS ───────────────────────────────────────────────────
  "prensa": "NEWSPAPERS",
  "periodicos": "NEWSPAPERS",
  "periódicos": "NEWSPAPERS",
  "newspapers": "NEWSPAPERS",
  "medios impresos": "NEWSPAPERS",
  "periodismo": "NEWSPAPERS",

  // ── GESTIÓN SIN ÁNIMO DE LUCRO ────────────────────────────────────────────
  "sin animo de lucro": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "sin ánimo de lucro": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "nonprofit": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "fundacion": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "fundación": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "osc": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "tercer sector": "NON_PROFIT_ORGANIZATION_MANAGEMENT",
  "entidad sin animo de lucro": "NON_PROFIT_ORGANIZATION_MANAGEMENT",

  // ── PETRÓLEO Y ENERGÍA ────────────────────────────────────────────────────
  "petroleo": "OIL_ENERGY",
  "petróleo": "OIL_ENERGY",
  "energia": "OIL_ENERGY",
  "energía": "OIL_ENERGY",
  "oil": "OIL_ENERGY",
  "gas": "OIL_ENERGY",
  "oil and gas": "OIL_ENERGY",
  "gas natural": "OIL_ENERGY",
  "refineria": "OIL_ENERGY",
  "refinería": "OIL_ENERGY",
  "sector energetico": "OIL_ENERGY",
  "sector energético": "OIL_ENERGY",
  "energia fosil": "OIL_ENERGY",
  "energía fósil": "OIL_ENERGY",

  // ── MEDIOS ONLINE ─────────────────────────────────────────────────────────
  "medios online": "ONLINE_MEDIA",
  "online media": "ONLINE_MEDIA",
  "medios digitales": "ONLINE_MEDIA",
  "editorial digital": "ONLINE_MEDIA",
  "contenido digital": "ONLINE_MEDIA",

  // ── EXTERNALIZACIÓN / BPO ─────────────────────────────────────────────────
  "externalizacion": "OUTSOURCING_OFFSHORING",
  "externalización": "OUTSOURCING_OFFSHORING",
  "outsourcing": "OUTSOURCING_OFFSHORING",
  "bpo": "OUTSOURCING_OFFSHORING",
  "offshoring": "OUTSOURCING_OFFSHORING",

  // ── ENVÍOS Y MENSAJERÍA ───────────────────────────────────────────────────
  "envios": "PACKAGE_FREIGHT_DELIVERY",
  "envíos": "PACKAGE_FREIGHT_DELIVERY",
  "paqueteria": "PACKAGE_FREIGHT_DELIVERY",
  "paquetería": "PACKAGE_FREIGHT_DELIVERY",
  "freight": "PACKAGE_FREIGHT_DELIVERY",
  "carga": "PACKAGE_FREIGHT_DELIVERY",
  "transporte de mercancias": "PACKAGE_FREIGHT_DELIVERY",
  "transporte de mercancías": "PACKAGE_FREIGHT_DELIVERY",

  // ── PACKAGING ─────────────────────────────────────────────────────────────
  "packaging": "PACKAGING_AND_CONTAINERS",
  "envases": "PACKAGING_AND_CONTAINERS",
  "embalaje": "PACKAGING_AND_CONTAINERS",
  "contenedores": "PACKAGING_AND_CONTAINERS",
  "industria del envase": "PACKAGING_AND_CONTAINERS",

  // ── PAPEL Y PRODUCTOS FORESTALES ──────────────────────────────────────────
  "papel": "PAPER_FOREST_PRODUCTS",
  "carton": "PAPER_FOREST_PRODUCTS",
  "cartón": "PAPER_FOREST_PRODUCTS",
  "madera": "PAPER_FOREST_PRODUCTS",
  "industria maderera": "PAPER_FOREST_PRODUCTS",
  "papel y carton": "PAPER_FOREST_PRODUCTS",
  "papel y cartón": "PAPER_FOREST_PRODUCTS",
  "sector forestal": "PAPER_FOREST_PRODUCTS",
  "aserradero": "PAPER_FOREST_PRODUCTS",

  // ── ARTES ESCÉNICAS ───────────────────────────────────────────────────────
  "artes escenicas": "PERFORMING_ARTS",
  "artes escénicas": "PERFORMING_ARTS",
  "teatro": "PERFORMING_ARTS",
  "danza": "PERFORMING_ARTS",
  "performing arts": "PERFORMING_ARTS",
  "opera": "PERFORMING_ARTS",
  "ópera": "PERFORMING_ARTS",

  // ── FARMACÉUTICO ──────────────────────────────────────────────────────────
  "farmaceutico": "PHARMACEUTICALS",
  "farmacéutico": "PHARMACEUTICALS",
  "farmacia": "PHARMACEUTICALS",
  "farmacias": "PHARMACEUTICALS",
  "pharmaceuticals": "PHARMACEUTICALS",
  "industria farmaceutica": "PHARMACEUTICALS",
  "industria farmacéutica": "PHARMACEUTICALS",
  "laboratorio farmaceutico": "PHARMACEUTICALS",
  "laboratorio farmacéutico": "PHARMACEUTICALS",
  "medicamentos": "PHARMACEUTICALS",

  // ── FILANTROPÍA ───────────────────────────────────────────────────────────
  "filantropia": "PHILANTHROPY",
  "filantropía": "PHILANTHROPY",
  "philanthropy": "PHILANTHROPY",
  "donaciones": "PHILANTHROPY",
  "mecenazgo": "PHILANTHROPY",

  // ── FOTOGRAFÍA ────────────────────────────────────────────────────────────
  "fotografia": "PHOTOGRAPHY",
  "fotografía": "PHOTOGRAPHY",
  "photography": "PHOTOGRAPHY",
  "fotografia comercial": "PHOTOGRAPHY",
  "fotografia industrial": "PHOTOGRAPHY",

  // ── PLÁSTICOS ─────────────────────────────────────────────────────────────
  "plasticos": "PLASTICS",
  "plásticos": "PLASTICS",
  "plastics": "PLASTICS",
  "industria del plastico": "PLASTICS",
  "industria del plástico": "PLASTICS",
  "inyeccion de plastico": "PLASTICS",
  "inyección de plástico": "PLASTICS",
  "polimeros": "PLASTICS",
  "polímeros": "PLASTICS",

  // ── ORGANIZACIONES POLÍTICAS ──────────────────────────────────────────────
  "politica": "POLITICAL_ORGANIZATION",
  "política": "POLITICAL_ORGANIZATION",
  "partido politico": "POLITICAL_ORGANIZATION",
  "partido político": "POLITICAL_ORGANIZATION",
  "organizaciones politicas": "POLITICAL_ORGANIZATION",

  // ── EDUCACIÓN PRIMARIA Y SECUNDARIA ──────────────────────────────────────
  "educacion primaria": "PRIMARY_SECONDARY_EDUCATION",
  "educación primaria": "PRIMARY_SECONDARY_EDUCATION",
  "educacion secundaria": "PRIMARY_SECONDARY_EDUCATION",
  "educación secundaria": "PRIMARY_SECONDARY_EDUCATION",
  "colegio": "PRIMARY_SECONDARY_EDUCATION",
  "instituto": "PRIMARY_SECONDARY_EDUCATION",
  "escuela": "PRIMARY_SECONDARY_EDUCATION",
  "educacion": "PRIMARY_SECONDARY_EDUCATION",
  "educación": "PRIMARY_SECONDARY_EDUCATION",
  "ensenanza": "PRIMARY_SECONDARY_EDUCATION",
  "enseñanza": "PRIMARY_SECONDARY_EDUCATION",
  "formacion profesional": "PRIMARY_SECONDARY_EDUCATION",
  "formación profesional": "PRIMARY_SECONDARY_EDUCATION",

  // ── ARTES GRÁFICAS / IMPRESIÓN ────────────────────────────────────────────
  "impresion": "PRINTING",
  "impresión": "PRINTING",
  "printing": "PRINTING",
  "artes graficas": "PRINTING",
  "artes gráficas": "PRINTING",
  "imprenta": "PRINTING",
  "serigrafía": "PRINTING",
  "serigrafia": "PRINTING",
  "rotulacion": "PRINTING",
  "rotulación": "PRINTING",

  // ── FORMACIÓN Y COACHING ──────────────────────────────────────────────────
  "formacion": "PROFESSIONAL_TRAINING_COACHING",
  "formación": "PROFESSIONAL_TRAINING_COACHING",
  "coaching": "PROFESSIONAL_TRAINING_COACHING",
  "capacitacion": "PROFESSIONAL_TRAINING_COACHING",
  "capacitación": "PROFESSIONAL_TRAINING_COACHING",
  "training": "PROFESSIONAL_TRAINING_COACHING",
  "desarrollo profesional": "PROFESSIONAL_TRAINING_COACHING",
  "mentoring": "PROFESSIONAL_TRAINING_COACHING",

  // ── DESARROLLO DE PROGRAMAS ───────────────────────────────────────────────
  "desarrollo de programas": "PROGRAM_DEVELOPMENT",
  "program development": "PROGRAM_DEVELOPMENT",
  "gestion de programas": "PROGRAM_DEVELOPMENT",
  "gestión de programas": "PROGRAM_DEVELOPMENT",

  // ── POLÍTICAS PÚBLICAS ────────────────────────────────────────────────────
  "politicas publicas": "PUBLIC_POLICY",
  "políticas públicas": "PUBLIC_POLICY",
  "public policy": "PUBLIC_POLICY",
  "regulacion": "PUBLIC_POLICY",
  "regulación": "PUBLIC_POLICY",

  // ── RELACIONES PÚBLICAS ───────────────────────────────────────────────────
  "relaciones publicas": "PUBLIC_RELATIONS_AND_COMMUNICATIONS",
  "relaciones públicas": "PUBLIC_RELATIONS_AND_COMMUNICATIONS",
  "public relations": "PUBLIC_RELATIONS_AND_COMMUNICATIONS",
  "pr": "PUBLIC_RELATIONS_AND_COMMUNICATIONS",
  "comunicacion corporativa": "PUBLIC_RELATIONS_AND_COMMUNICATIONS",
  "comunicación corporativa": "PUBLIC_RELATIONS_AND_COMMUNICATIONS",

  // ── SEGURIDAD PÚBLICA ─────────────────────────────────────────────────────
  "seguridad privada": "PUBLIC_SAFETY",
  "proteccion civil": "PUBLIC_SAFETY",
  "protección civil": "PUBLIC_SAFETY",
  "bomberos": "PUBLIC_SAFETY",
  "emergencias": "PUBLIC_SAFETY",
  "public safety": "PUBLIC_SAFETY",

  // ── EDITORIAL / PUBLICACIONES ─────────────────────────────────────────────
  "editorial": "PUBLISHING",
  "publishing": "PUBLISHING",
  "publicaciones": "PUBLISHING",
  "edicion de libros": "PUBLISHING",
  "edición de libros": "PUBLISHING",
  "libros": "PUBLISHING",
  "revistas": "PUBLISHING",
  "medios de prensa": "PUBLISHING",

  // ── FABRICACIÓN FERROVIARIA ───────────────────────────────────────────────
  "ferroviario": "RAILROAD_MANUFACTURE",
  "trenes": "RAILROAD_MANUFACTURE",
  "railroad": "RAILROAD_MANUFACTURE",
  "material ferroviario": "RAILROAD_MANUFACTURE",
  "fabricacion ferroviaria": "RAILROAD_MANUFACTURE",
  "fabricación ferroviaria": "RAILROAD_MANUFACTURE",

  // ── GANADERÍA ─────────────────────────────────────────────────────────────
  "ganaderia": "RANCHING",
  "ganadería": "RANCHING",
  "ranching": "RANCHING",
  "granja": "RANCHING",
  "sector ganadero": "RANCHING",
  "produccion ganadera": "RANCHING",

  // ── INMOBILIARIA ─────────────────────────────────────────────────────────
  "inmobiliaria": "REAL_ESTATE",
  "inmobiliario": "REAL_ESTATE",
  "real estate": "REAL_ESTATE",
  "sector inmobiliario": "REAL_ESTATE",
  "agencia inmobiliaria": "REAL_ESTATE",
  "compraventa de inmuebles": "REAL_ESTATE",
  "promotora inmobiliaria": "REAL_ESTATE",
  "alquiler": "REAL_ESTATE",

  // ── OCIO Y SERVICIOS RECREATIVOS ──────────────────────────────────────────
  "ocio y recreacion": "RECREATIONAL_FACILITIES_AND_SERVICES",
  "ocio y recreación": "RECREATIONAL_FACILITIES_AND_SERVICES",
  "parques de atracciones": "RECREATIONAL_FACILITIES_AND_SERVICES",
  "centros deportivos": "RECREATIONAL_FACILITIES_AND_SERVICES",
  "instalaciones deportivas": "RECREATIONAL_FACILITIES_AND_SERVICES",
  "recreational facilities": "RECREATIONAL_FACILITIES_AND_SERVICES",

  // ── INSTITUCIONES RELIGIOSAS ──────────────────────────────────────────────
  "religion": "RELIGIOUS_INSTITUTIONS",
  "religión": "RELIGIOUS_INSTITUTIONS",
  "iglesia": "RELIGIOUS_INSTITUTIONS",
  "instituciones religiosas": "RELIGIOUS_INSTITUTIONS",
  "religious institutions": "RELIGIOUS_INSTITUTIONS",

  // ── ENERGÍAS RENOVABLES ───────────────────────────────────────────────────
  "renovables": "RENEWABLES_ENVIRONMENT",
  "energias renovables": "RENEWABLES_ENVIRONMENT",
  "energías renovables": "RENEWABLES_ENVIRONMENT",
  "renewables": "RENEWABLES_ENVIRONMENT",
  "solar": "RENEWABLES_ENVIRONMENT",
  "eolica": "RENEWABLES_ENVIRONMENT",
  "eólica": "RENEWABLES_ENVIRONMENT",
  "energia solar": "RENEWABLES_ENVIRONMENT",
  "energia eolica": "RENEWABLES_ENVIRONMENT",
  "energía solar": "RENEWABLES_ENVIRONMENT",
  "energía eólica": "RENEWABLES_ENVIRONMENT",
  "biomasa": "RENEWABLES_ENVIRONMENT",
  "hidraulica": "RENEWABLES_ENVIRONMENT",
  "hidráulica": "RENEWABLES_ENVIRONMENT",
  "sostenibilidad": "RENEWABLES_ENVIRONMENT",

  // ── INVESTIGACIÓN ─────────────────────────────────────────────────────────
  "investigacion": "RESEARCH",
  "investigación": "RESEARCH",
  "i+d": "RESEARCH",
  "research": "RESEARCH",
  "i+d+i": "RESEARCH",
  "laboratorio de investigacion": "RESEARCH",
  "laboratorio de investigación": "RESEARCH",
  "ciencia": "RESEARCH",
  "centro de investigacion": "RESEARCH",
  "centro de investigación": "RESEARCH",

  // ── RESTAURACIÓN ─────────────────────────────────────────────────────────
  "restaurante": "RESTAURANTS",
  "restaurantes": "RESTAURANTS",
  "restauracion": "RESTAURANTS",
  "restauración": "RESTAURANTS",
  "gastronomia": "RESTAURANTS",
  "gastronomía": "RESTAURANTS",
  "comida rapida": "RESTAURANTS",
  "comida rápida": "RESTAURANTS",
  "fast food": "RESTAURANTS",
  "delivery de comida": "RESTAURANTS",

  // ── COMERCIO MINORISTA ────────────────────────────────────────────────────
  "retail": "RETAIL",
  "comercio minorista": "RETAIL",
  "tienda": "RETAIL",
  "venta al por menor": "RETAIL",
  "venta minorista": "RETAIL",
  "comercio": "RETAIL",

  // ── SEGURIDAD E INVESTIGACIONES ───────────────────────────────────────────
  "seguridad": "SECURITY_AND_INVESTIGATIONS",
  "investigacion privada": "SECURITY_AND_INVESTIGATIONS",
  "investigación privada": "SECURITY_AND_INVESTIGATIONS",
  "detective": "SECURITY_AND_INVESTIGATIONS",
  "vigilancia": "SECURITY_AND_INVESTIGATIONS",
  "alarmas": "SECURITY_AND_INVESTIGATIONS",
  "sistemas de seguridad": "SECURITY_AND_INVESTIGATIONS",

  // ── SEMICONDUCTORES ───────────────────────────────────────────────────────
  "semiconductores": "SEMICONDUCTORS",
  "semiconductors": "SEMICONDUCTORS",
  "microchips": "SEMICONDUCTORS",
  "chips": "SEMICONDUCTORS",
  "circuitos integrados": "SEMICONDUCTORS",

  // ── CONSTRUCCIÓN NAVAL ────────────────────────────────────────────────────
  "construccion naval": "SHIPBUILDING",
  "construcción naval": "SHIPBUILDING",
  "shipbuilding": "SHIPBUILDING",
  "astillero": "SHIPBUILDING",
  "astilleros": "SHIPBUILDING",
  "barcos": "SHIPBUILDING",

  // ── ARTÍCULOS DEPORTIVOS ──────────────────────────────────────────────────
  "articulos deportivos": "SPORTING_GOODS",
  "artículos deportivos": "SPORTING_GOODS",
  "equipamiento deportivo": "SPORTING_GOODS",
  "sporting goods": "SPORTING_GOODS",
  "material deportivo": "SPORTING_GOODS",

  // ── DEPORTES ──────────────────────────────────────────────────────────────
  "deportes": "SPORTS",
  "sports": "SPORTS",
  "futbol": "SPORTS",
  "fútbol": "SPORTS",
  "baloncesto": "SPORTS",
  "tenis": "SPORTS",
  "club deportivo": "SPORTS",

  // ── SELECCIÓN Y RECLUTAMIENTO ─────────────────────────────────────────────
  "seleccion de personal": "STAFFING_AND_RECRUITING",
  "selección de personal": "STAFFING_AND_RECRUITING",
  "reclutamiento": "STAFFING_AND_RECRUITING",
  "recruiting": "STAFFING_AND_RECRUITING",
  "staffing": "STAFFING_AND_RECRUITING",
  "headhunting": "STAFFING_AND_RECRUITING",
  "trabajo temporal": "STAFFING_AND_RECRUITING",
  "ett": "STAFFING_AND_RECRUITING",
  "empresa de trabajo temporal": "STAFFING_AND_RECRUITING",

  // ── SUPERMERCADOS ─────────────────────────────────────────────────────────
  "supermercado": "SUPERMARKETS",
  "supermercados": "SUPERMARKETS",
  "gran superficie": "SUPERMARKETS",
  "hipermercado": "SUPERMARKETS",
  "distribucion alimentaria": "SUPERMARKETS",
  "distribución alimentaria": "SUPERMARKETS",

  // ── TELECOMUNICACIONES ────────────────────────────────────────────────────
  "telecomunicaciones": "TELECOMMUNICATIONS",
  "telecommunications": "TELECOMMUNICATIONS",
  "telecom": "TELECOMMUNICATIONS",
  "operadora": "TELECOMMUNICATIONS",
  "operador de telecomunicaciones": "TELECOMMUNICATIONS",
  "telefonia": "TELECOMMUNICATIONS",
  "telefonía": "TELECOMMUNICATIONS",
  "banda ancha": "TELECOMMUNICATIONS",
  "fibra optica": "TELECOMMUNICATIONS",
  "fibra óptica": "TELECOMMUNICATIONS",
  "satelite": "TELECOMMUNICATIONS",
  "satélite": "TELECOMMUNICATIONS",

  // ── TEXTIL ────────────────────────────────────────────────────────────────
  "textil": "TEXTILES",
  "textiles": "TEXTILES",
  "industria textil": "TEXTILES",
  "fibras textiles": "TEXTILES",
  "tejidos": "TEXTILES",
  "hilatura": "TEXTILES",
  "tejeduría": "TEXTILES",
  "tejeduria": "TEXTILES",

  // ── THINK TANKS ───────────────────────────────────────────────────────────
  "think tank": "THINK_TANKS",
  "think tanks": "THINK_TANKS",
  "centro de estudios": "THINK_TANKS",
  "instituto de investigacion politica": "THINK_TANKS",

  // ── TABACO ────────────────────────────────────────────────────────────────
  "tabaco": "TOBACCO",
  "tobacco": "TOBACCO",
  "cigarrillos": "TOBACCO",
  "industria tabaquera": "TOBACCO",

  // ── TRADUCCIÓN Y LOCALIZACIÓN ─────────────────────────────────────────────
  "traduccion": "TRANSLATION_AND_LOCALIZATION",
  "traducción": "TRANSLATION_AND_LOCALIZATION",
  "localizacion": "TRANSLATION_AND_LOCALIZATION",
  "localización": "TRANSLATION_AND_LOCALIZATION",
  "translation": "TRANSLATION_AND_LOCALIZATION",
  "interpretacion": "TRANSLATION_AND_LOCALIZATION",
  "interpretación": "TRANSLATION_AND_LOCALIZATION",
  "servicios lingüísticos": "TRANSLATION_AND_LOCALIZATION",
  "servicios linguisticos": "TRANSLATION_AND_LOCALIZATION",

  // ── TRANSPORTE ────────────────────────────────────────────────────────────
  "transporte": "TRANSPORTATION_TRUCKING_RAILROAD",
  "transportation": "TRANSPORTATION_TRUCKING_RAILROAD",
  "transporte por carretera": "TRANSPORTATION_TRUCKING_RAILROAD",
  "camiones": "TRANSPORTATION_TRUCKING_RAILROAD",
  "flota de vehiculos": "TRANSPORTATION_TRUCKING_RAILROAD",
  "flota de vehículos": "TRANSPORTATION_TRUCKING_RAILROAD",
  "ferrocarril": "TRANSPORTATION_TRUCKING_RAILROAD",
  "tren de mercancias": "TRANSPORTATION_TRUCKING_RAILROAD",
  "tren de mercancías": "TRANSPORTATION_TRUCKING_RAILROAD",
  "transporte ferroviario": "TRANSPORTATION_TRUCKING_RAILROAD",

  // ── SERVICIOS PÚBLICOS (UTILITIES) ────────────────────────────────────────
  "servicios publicos": "UTILITIES",
  "servicios públicos": "UTILITIES",
  "utilities": "UTILITIES",
  "electricidad": "UTILITIES",
  "agua": "UTILITIES",
  "suministros": "UTILITIES",
  "distribucion electrica": "UTILITIES",
  "distribución eléctrica": "UTILITIES",
  "red electrica": "UTILITIES",
  "red eléctrica": "UTILITIES",
  "gestion de agua": "UTILITIES",
  "gestión de agua": "UTILITIES",

  // ── VENTURE CAPITAL / PRIVATE EQUITY ──────────────────────────────────────
  "venture capital": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "private equity": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "capital riesgo": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "inversor": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "fondo de capital riesgo": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "inversores": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "aceleradora": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "incubadora": "VENTURE_CAPITAL_PRIVATE_EQUITY",
  "business angel": "VENTURE_CAPITAL_PRIVATE_EQUITY",

  // ── VETERINARIA ───────────────────────────────────────────────────────────
  "veterinaria": "VETERINARY",
  "veterinario": "VETERINARY",
  "veterinary": "VETERINARY",
  "clinica veterinaria": "VETERINARY",
  "clínica veterinaria": "VETERINARY",
  "animales de compania": "VETERINARY",
  "animales de compañía": "VETERINARY",

  // ── ALMACENAMIENTO ────────────────────────────────────────────────────────
  "almacenamiento": "WAREHOUSING",
  "warehousing": "WAREHOUSING",
  "almacen": "WAREHOUSING",
  "almacén": "WAREHOUSING",
  "almacenes": "WAREHOUSING",
  "deposito": "WAREHOUSING",
  "depósito": "WAREHOUSING",
  "centro logistico": "WAREHOUSING",
  "centro logístico": "WAREHOUSING",

  // ── COMERCIO MAYORISTA ────────────────────────────────────────────────────
  "mayorista": "WHOLESALE",
  "wholesale": "WHOLESALE",
  "comercio mayorista": "WHOLESALE",
  "distribucion mayorista": "WHOLESALE",
  "distribución mayorista": "WHOLESALE",
  "venta al por mayor": "WHOLESALE",

  // ── VINO Y LICORES ────────────────────────────────────────────────────────
  "vino": "WINE_AND_SPIRITS",
  "vinos": "WINE_AND_SPIRITS",
  "bodega": "WINE_AND_SPIRITS",
  "bodegas": "WINE_AND_SPIRITS",
  "licores": "WINE_AND_SPIRITS",
  "destileria": "WINE_AND_SPIRITS",
  "destilería": "WINE_AND_SPIRITS",
  "spirits": "WINE_AND_SPIRITS",
  "cerveza": "WINE_AND_SPIRITS",
  "cervecera": "WINE_AND_SPIRITS",

  // ── TECNOLOGÍA INALÁMBRICA ────────────────────────────────────────────────
  "inalambrico": "WIRELESS",
  "inalámbrico": "WIRELESS",
  "wireless": "WIRELESS",
  "movil": "WIRELESS",
  "móvil": "WIRELESS",
  "telefonia movil": "WIRELESS",
  "telefonía móvil": "WIRELESS",
  "5g": "WIRELESS",
  "4g": "WIRELESS",

  // ── ESCRITURA Y EDICIÓN ───────────────────────────────────────────────────
  "escritura": "WRITING_AND_EDITING",
  "edicion de contenidos": "WRITING_AND_EDITING",
  "edición de contenidos": "WRITING_AND_EDITING",
  "copywriting": "WRITING_AND_EDITING",
  "redaccion": "WRITING_AND_EDITING",
  "redacción": "WRITING_AND_EDITING",
  "content writing": "WRITING_AND_EDITING",
  "writing": "WRITING_AND_EDITING",

  // ── JUEGOS MÓVILES ────────────────────────────────────────────────────────
  "juegos moviles": "MOBILE_GAMES",
  "juegos móviles": "MOBILE_GAMES",
  "mobile games": "MOBILE_GAMES",
  "gaming movil": "MOBILE_GAMES",
  "gaming móvil": "MOBILE_GAMES",
  "app de juegos": "MOBILE_GAMES",
};

// ─────────────────────────────────────────────────────────────────────────────
// Función de normalización de texto (elimina tildes, lowercase, trim)
// ─────────────────────────────────────────────────────────────────────────────
function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // elimina diacríticos
}

// ─────────────────────────────────────────────────────────────────────────────
// Función principal de mapeo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convierte un valor de sector/industria en texto libre al enum de HubSpot.
 *
 * - Hace búsqueda exacta primero (tras normalizar).
 * - Si no hay coincidencia exacta, intenta búsqueda parcial (substring).
 * - Devuelve `undefined` si no hay mapeo → el campo no se enviará a HubSpot.
 *
 * @param industry  Valor de sector que viene de Apollo.io, Supabase u otra fuente.
 * @returns         Valor del enum HubSpot o `undefined` si no hay mapeo.
 */
export function mapIndustryToHubSpot(
  industry: string | null | undefined
): HubSpotIndustry | undefined {
  if (!industry) return undefined;

  const normalized = normalizeText(industry);
  if (!normalized) return undefined;

  // 1. Coincidencia exacta
  const exact = INDUSTRY_MAP[normalized];
  if (exact) return exact;

  // 2. Coincidencia parcial: buscar si alguna clave del mapa está contenida
  //    en el valor recibido (útil para "sector metalurgia y siderurgia")
  for (const [key, value] of Object.entries(INDUSTRY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // 3. Sin mapeo → devolver undefined para no enviar el campo
  return undefined;
}

/**
 * Variante que devuelve el enum como string o null (útil para cleanProperties).
 */
export function mapIndustryToHubSpotString(
  industry: string | null | undefined
): string | null {
  return mapIndustryToHubSpot(industry) ?? null;
}