import { sequelize } from "../db.js";
import { Asterium } from "../models/Asterium.js";
import type { AsteriumCreation } from "../models/Asterium.js"


  const asterium: AsteriumCreation[]= [
    {
      "id": 1,
      "author_id": 1,
      "title": "James Webb detecta 'cuentas oscuras' inexplicables en la atmósfera de Saturno",
      "excerpt": "Observaciones del JWST han mostrado estructuras en forma de cuentas oscuras sobre el polo norte de Saturno.",
      "content_md": "El Telescopio Espacial **James Webb (JWST)** ha captado pequeñas estructuras oscuras en la **ionosfera de Saturno**, alineadas como si fueran cuentas sobre un hilo alrededor del polo norte.\n\nJunto a este fenómeno aparece un **patrón estelar asimétrico** en la estratosfera cuya naturaleza no está clara y que podría deberse a ondas de gravedad, a interacciones con el campo magnético del planeta o a efectos estacionales de iluminación.\n\nEstas observaciones son relevantes porque podrían afinar los **modelos de circulación** de las atmósferas gigantes, cuantificar el acoplamiento **ionosfera–estratosfera** y ofrecer analogías para interpretar señales en **Júpiter** y en exoplanetas con condiciones similares.\n\nLos próximos pasos incluyen series temporales con NIRCam/MIRI para seguir la evolución de las “cuentas” y espectros de mayor resolución que separen los efectos de **composición**, **temperatura** y **geometría de iluminación**.",
      "status": "published",
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760346793/404-bg_v4en4l.jpg"
    },
    {
      "id": 2,
      "author_id": 2,
      "title": "Nuevo candidato a 'estrella-agujero negro' detectado por JWST",
      "excerpt": "Astrónomos proponen una nueva clase de objeto —'black hole star'— basada en observaciones del JWST.",
      "content_md": "Análisis recientes de datos del JWST sobre los *\"little red dots\"* apuntan a objetos dominados por un **agujero negro envuelto** en gas estelar denso, una hipotética **estrella–agujero negro** cuya luminosidad estaría regulada por la acreción y el transporte radiativo en su envoltura.\n\nEntre las señales observacionales destacan **espectros muy rojos** con exceso infrarrojo, **líneas anchas** compatibles con pozos de potencial profundos y **variabilidad** asociada a episodios de acreción intermitente.\n\nDe confirmarse, estos candidatos aportarían pistas sobre el **crecimiento temprano** de agujeros negros, la relación entre **formación estelar** y **acreción**, y los estados transitorios de **evolución estelar extrema**.\n\nSe requieren espectros con mayor relación señal/ruido y simulaciones hidrodinámicas radiativas para evaluar la estabilidad del sistema y distinguirlo de otras clases de objetos compactos.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760347643/STScI-01GX6584JDCNAKDR7HSST2F5XX_wekfec.jpg"
    },
    {
      "id": 3,
      "author_id": 3,
      "title": "La cuenta oficial de exoplanetas confirmados de la NASA alcanza 6,000",
      "excerpt": "NASA anuncia que el catálogo oficial supera los 6.000 exoplanetas confirmados.",
      "content_md": "El número de exoplanetas confirmados registrados por el **NExScI de la NASA** ha superado los **6.000**, reflejando décadas de avances en instrumentación y análisis de datos.\n\nLos métodos de detección incluyen **tránsitos** (Kepler/TESS), **velocidad radial**, **imagen directa** con coronografía y **microlentes gravitatorias**, cada uno sensible a diferentes masas, periodos y arquitecturas de sistemas.\n\nLa siguiente frontera es la **caracterización atmosférica**: detección de H₂O, CO₂ o CH₄, estudio de **climas** mediante curvas de fase y comprensión estadística de la **habitabilidad** en torno a enanas M.\n\nLa diversidad de mundos descubiertos —desde júpiteres calientes hasta subtierras— ofrece un laboratorio natural para poner a prueba los modelos de **formación y evolución planetaria**.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760347781/5k-exo-beauty-lores-final_mdnodc.webp"
    },
    {
      "id": 4,
      "author_id": 4,
      "title": "El Webb revela detalles vibrantes en la mayor nube formadora de estrellas de la Vía Láctea",
      "excerpt": "Imágenes del JWST muestran una rica estructura de estrellas masivas y polvo en Sagittarius B2.",
      "content_md": "Las observaciones con **NIRCam** y **MIRI** del JWST revelan la compleja morfología de **Sagittarius B2**, la mayor fábrica estelar de la Vía Láctea, con filamentos, cavidades y cúmulos de protoestrellas masivas.\n\nLos datos muestran **chorros bipolares**, cavidades esculpidas por **vientos** y **radiación** de estrellas OB, además de indicios de **química compleja** en nubes frías cercanas.\n\nEstos resultados permiten medir **tasas de formación estelar**, estudiar el **feedback** de las estrellas jóvenes en su entorno y refinar la **función de masa inicial** en entornos de alta densidad.\n\nCampañas coordinadas con **ALMA** ayudarán a completar la imagen del gas frío y el polvo milimétrico que alimentan el nacimiento de nuevas generaciones estelares.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760348215/STScI-01K4T8XYNBJ9A93DJ9KYQJE2WF_w791dj.png"
    },
    {
      "id": 5,
      "author_id": 5,
      "title": "ESA lanza NELIOTA-III para vigilar impactos en la Luna",
      "excerpt": "Nuevo proyecto europeo ampliará la detección y base de datos de destellos por impactos lunares.",
      "content_md": "La ESA inicia **NELIOTA-III**, un proyecto para mejorar la detección de **destellos de impacto** en la Luna mediante cámaras rápidas, fotometría multibanda y algoritmos de detección automática.\n\nLa Luna actúa como un **detector natural** sin atmósfera: cada impacto genera un destello observable que ayuda a calibrar las tasas de **meteoroides** que también cruzan la órbita terrestre.\n\nEl programa creará una **base de datos abierta** con hora y energía estimada de cada evento, posición selenográfica y **curvas de luz** que permitirán comparar con lluvias de meteoros y modelos de corrientes meteóricas.\n\nEstos datos serán útiles para planificar **operaciones lunares** más seguras, protegiendo hábitats, trajes y vehículos frente al riesgo de microimpactos.",
      "status": "published",
      "published_at": null,        
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760348358/s2-mareimbrium_1920x1080_xd1qpa.jpg"
    },
    {
      "id": 6,
      "author_id": 6,
      "title": "Imagen del día: la atmósfera de Marte en una paleta 'mille-feuille'",
      "excerpt": "Una sonda de la ESA muestra capas coloreadas y delicadas en la atmósfera marciana.",
      "content_md": "Recientes imágenes de la ESA muestran la atmósfera de Marte con **capas finas y coloridas**, un auténtico *mille-feuille* atmosférico en el que se distinguen inversiones térmicas y ondas orográficas.\n\nEstas estructuras están asociadas a aerosoles de **hielo de agua** y polvo fino, así como a la modulación de vientos generados por mesetas volcánicas como **Tharsis**.\n\nCaracterizar la estratificación y su variabilidad estacional ayuda a mejorar los **modelos climáticos** marcianos, planificar **entradas atmosféricas** y vuelos de drones, y entender la **pérdida de agua** a lo largo de escalas geológicas.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760350063/404_opfphh.jpg"
    },
    {
      "id": 7,
      "author_id": 7,
      "title": "Estudio propone telescopio rectangular para encontrar 'Tierra 2.0'",
      "excerpt": "Investigadores sugieren que un diseño rectangular permitiría resolver exoplanetas rocosos cercanos con más eficacia.",
      "content_md": "Un nuevo estudio explora cómo un **espejo rectangular** podría mejorar la resolución angular en un eje, facilitando la separación planeta–estrella en búsquedas de **Tierra 2.0** a costes estructurales más contenidos.\n\nEntre las ventajas se mencionan un **patrón de difracción** más estrecho en una dirección, la **segmentación** eficiente y un **escaneo** rápido lineal; entre los retos, el control de **aberraciones** fuera del eje principal, coronografía adaptada y algoritmos de **deconvolución** específicos.\n\nLa propuesta reabre el debate sobre geometrías no circulares en futuros observatorios directos de exoplanetas rocosos cercanos.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760350327/space_telescope_illustration_zgsb89.jpg"
    },
    {
      "id": 8,
      "author_id": 8,
      "title": "Hubble descubre remanente de fusión de enanas blancas",
      "excerpt": "El Hubble detecta una enana blanca ultra-masiva tras la fusión de dos enanas blancas.",
      "content_md": "Observaciones con el **Hubble** identificaron un remanente raro que sugiere la formación por **fusión de dos enanas blancas**, resultando en una enana blanca **ultra-masiva** con propiedades inusuales.\n\nLa evidencia incluye una **gravedad superficial** y una **masa** superiores a lo habitual, huellas térmicas compatibles con **calentamiento por fusión** y una composición química anómala con exceso de **neón/oxígeno**.\n\nEstos objetos son laboratorios para estudiar la **materia degenerada**, los orígenes de **supernovas tipo Ia** subluminosas y la evolución de **sistemas binarios compactos**.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760350447/STScI-01EVTB5B7AEQ4RYPV452FZEBMF_tz4df1.jpg"
    },
    {
      "id": 9,
      "author_id": 9,
      "title": "Astrónomos detectan un planeta gigante escondido en un sistema conocido",
      "excerpt": "Estudios recientes indican la presencia de un planeta masivo emergiendo de una nube protoplanetaria.",
      "content_md": "Imágenes de **discos protoplanetarios** revelan huecos y espirales consistentes con un **planeta gigante** en formación, con masa de varios Júpiter, emergiendo del material circundante.\n\nLas pistas incluyen **anillos y asimetrías** en el polvo milimétrico, gradientes térmicos locales y posibles **chorros** de acreción planetaria que delatan la interacción **planeta–disco**.\n\nComprender estos procesos aclara los tiempos de **ensamblaje** de gigantes gaseosos, las rutas de **migración** y la formación de **sistemas de satélites** alrededor de estos nuevos mundos.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760350612/ZGcbvhbCnht3jKqEFskS3k-650-80.png_q4ufc2.webp"
    },
    {
      "id": 10,
      "author_id": 10,
      "title": "TRAPPIST-1e: JWST busca señales de atmósfera en el planeta habitable",
      "excerpt": "Nuevos datos del JWST apuntan a investigar la composición atmosférica de TRAPPIST-1e.",
      "content_md": "Observaciones con **NIRSpec** del JWST buscan trazas de **gases atmosféricos** en **TRAPPIST-1e**, un mundo templado en zona habitable en torno a una enana M.\n\nLos objetivos incluyen detectar o acotar **CO₂**, **H₂O** y **CH₄**, medir la **opacidad** y la posible presencia de **nubes** o **brumas**, y comparar con **modelos fotogeoquímicos** que predicen la evolución atmosférica bajo intensa radiación estelar.\n\nEntre los desafíos figuran la **actividad estelar** (llamaradas), la señal débil que exige **múltiples tránsitos** y las degeneraciones entre **composición** y **cobertura de nubes**.\n\nResultados acumulativos de varios tránsitos serán clave para confirmar o descartar una **atmósfera densa** en este prometedor exoplaneta.",
      "status": "published",
      "published_at": null,
      "image_url": "https://res.cloudinary.com/dm6gy5wsm/image/upload/v1760351161/PIA22093-NASA-1_pcsax9.jpg"
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
