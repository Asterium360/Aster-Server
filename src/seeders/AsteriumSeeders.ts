import { sequelize } from "../db.js";
import { Asterium } from "../models/Asterium.js";
import type { AsteriumCreation } from "../models/Asterium.js"


  const asterium: AsteriumCreation[]= [
    {
      "id": 1,
      "author_id": 1,
      "title": "James Webb detecta 'cuentas oscuras' inexplicables en la atmósfera de Saturno",
      "excerpt": "Observaciones del JWST han mostrado estructuras en forma de cuentas oscuras sobre el polo norte de Saturno.",
      "content_md": "El Telescopio Espacial **James Webb (JWST)** captó pequeñas estructuras oscuras en la ionosfera de Saturno, junto a un patrón estelar asimétrico en la estratosfera.",
      "status": "published",
      "image_url": "https://www.nasa.gov/sites/default/files/thumbnails/image/saturn_dark_beads.jpg"
    },
    {
      "id": 2,
      "author_id": 2,
      "title": "Nuevo candidato a 'estrella-agujero negro' detectado por JWST",
      "excerpt": "Astrónomos proponen una nueva clase de objeto —'black hole star'— basada en observaciones del JWST.",
      "content_md": "Análisis recientes de datos del JWST sobre objetos conocidos como *'little red dots'* sugieren la posibilidad de agujeros negros envueltos en gas denso.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.nasa.gov/sites/default/files/thumbnails/image/black_hole_star_candidate.png"
    },
    {
      "id": 3,
      "author_id": 3,
      "title": "La cuenta oficial de exoplanetas confirmados de la NASA alcanza 6,000",
      "excerpt": "NASA anuncia que el catálogo oficial supera los 6.000 exoplanetas confirmados.",
      "content_md": "El número de exoplanetas confirmados registrados por el **NExScI de la NASA** ha sobrepasado la marca de 6.000.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.nasa.gov/sites/default/files/thumbnails/image/exoplanet_catalog.jpg"
    },
    {
      "id": 4,
      "author_id": 4,
      "title": "El Webb revela detalles vibrantes en la mayor nube formadora de estrellas de la Vía Láctea",
      "excerpt": "Imágenes del JWST muestran una rica estructura de estrellas masivas y polvo en Sagittarius B2.",
      "content_md": "Las observaciones con **NIRCam** y **MIRI** del JWST muestran regiones de formación estelar extremadamente activas.",
      "status": "published",
      "published_at": null,
      "image_url": "https://science.nasa.gov/system/news_items/main_images/10960_sagittarius_b2.jpg"
    },
    {
      "id": 5,
      "author_id": 5,
      "title": "ESA lanza NELIOTA-III para vigilar impactos en la Luna",
      "excerpt": "Nuevo proyecto europeo ampliará la detección y base de datos de destellos por impactos lunares.",
      "content_md": "La ESA inicia **NELIOTA-III**, un proyecto para mejorar la detección de impactos en la Luna y crear una base de datos abierta.",
      "status": "published",
      "published_at": null,        
      "image_url": "https://www.esa.int/var/esa/storage/images/2025/09/lunar_impact_observation.jpg"
    },
    {
      "id": 6,
      "author_id": 6,
      "title": "Imagen del día: la atmósfera de Marte en una paleta 'mille-feuille'",
      "excerpt": "Una sonda de la ESA muestra capas coloreadas y delicadas en la atmósfera marciana.",
      "content_md": "Recientes imágenes de la ESA muestran la atmósfera de Marte con capas finas y coloridas.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.esa.int/var/esa/storage/images/2025/09/mars_atmosphere_layers.jpg"
    },
    {
      "id": 7,
      "author_id": 7,
      "title": "Estudio propone telescopio rectangular para encontrar 'Tierra 2.0'",
      "excerpt": "Investigadores sugieren que un diseño rectangular permitiría resolver exoplanetas rocosos cercanos con más eficacia.",
      "content_md": "Un nuevo estudio explora cómo un espejo rectangular podría mejorar la resolución angular necesaria para detectar planetas similares a la Tierra.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.space.com/images/rectangular_telescope.jpg"
    },
    {
      "id": 8,
      "author_id": 8,
      "title": "Hubble descubre remanente de fusión de enanas blancas",
      "excerpt": "El Hubble detecta una enana blanca ultra-masiva tras la fusión de dos enanas blancas.",
      "content_md": "Observaciones con el **Hubble** identificaron un remanente raro que sugiere la formación por fusión de enanas blancas.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.nasa.gov/sites/default/files/thumbnails/image/white_dwarf_merger.jpg"
    },
    {
      "id": 9,
      "author_id": 9,
      "title": "Astrónomos detectan un planeta gigante escondido en un sistema conocido",
      "excerpt": "Estudios recientes indican la presencia de un planeta masivo emergiendo de una nube protoplanetaria.",
      "content_md": "Imágenes de discos protoplanetarios revelan señales de un objeto con masa de varios Júpiter alrededor de una estrella joven.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.space.com/images/monster_exoplanet_disk.jpg"
    },
    {
      "id": 10,
      "author_id": 10,
      "title": "TRAPPIST-1e: JWST busca señales de atmósfera en el planeta habitable",
      "excerpt": "Nuevos datos del JWST apuntan a investigar la composición atmosférica de TRAPPIST-1e.",
      "content_md": "Observaciones con **NIRSpec** del JWST buscan trazas de gases atmosféricos en TRAPPIST-1e.",
      "status": "published",
      "published_at": null,
      "image_url": "https://www.space.com/images/trappist_1e_atmosphere.jpg"
    }
  ]

const seedAsteriums = async (): Promise<void> =>{
  try {
    await sequelize.sync({ }); // Sincroniza los modelos con la base de datos, eliminando datos previos
  console.log("Database synchronized.");

  await Asterium.sync({ force: true }); // Fuerza la recreación de la tabla Asterium

    await Asterium.bulkCreate(asterium);
    console.log("Asteriums seeded successfully.");

  }
    catch (error) {console.error("Error seeding asteriums:", error);}
    finally {await sequelize.close(); console.log("Database connection closed.");}
}

void seedAsteriums();