 
# Sonos Stjórnunarsíða með Next.js og Tailwind

Verkefnið byggir á vefsíðu sem gerir notendum kleift að finna og stjórna Sonos hátölurum á neti. Með þessu verkefni var nýtt Sonos HTTP API og Spotify API til að veita háþróaða stjórn á hljómi, tónlist og tækinu sjálfu í rauntíma. Viðmótið er byggt með Next.js og Tailwind, sem tryggir bæði snörp og notendavænt viðmót.

## Virkni

### Tækjasýning og stjórnun

Þegar notandi fer á síðuna byrjar vefsíðan strax að leita af Sonos tækjum sem eru til staðar á netinu. Þegar tæki eru fundin eru þau sýnd í viðmóti þar sem notandinn getur auðveldlega valið hvaða tæki hann vill stjórna. Hvert tæki getur verið stjórnað fyrir sig, allt frá hljómskala (volume control) til spilanleika tónlistar.

### Spotify Tenging

Til að nýta Spotify þjónustuna þarf notandi að fara í "Settings" og bæta Spotify tengingu við síðuna. Þegar Spotify tengingin hefur verið sett upp, getur notandi einnig stillt uppháldstæki og við það tengt bæði Spotify og Sonos tækin saman. Spotify API-ið leyfir að velja lag, skipta milli laga og stjórna spilanleika tónlistar beint úr viðmótinu.

### Media Player og Samstilling

Einn af lykilhlutunum í verkefninu er media player sem syncast við öll tengd Sonos tæki. Þetta tryggir að allar breytingar sem notandinn framkvæmir, hvort sem það eru hljóðbreytingar eða tónlist, verða endurspeglast í rauntíma á öllum tengdum tækjum. Þetta er mikilvægt fyrir viðmótið þar sem það veitir hámarks notendavænt viðmót fyrir samstillt hljóð.

### Touch Control Box

Einn áhugaverðasti eiginleikinn sem bætt var við síðuna er touch control box. Þetta tæki gerir notendum kleift að stjórna tónlist og hljómi með því að nota sveifur (swipes) og smelli. Notendur geta sveifað til hægri, vinstri, upp og niður til að stýra lagavali og hljómi. Auk þess er hægt að þrítíklikka á touchpadinu og setja sérsniðnar aðgerðir fyrir fjóra takka sem eru staðsettir í sitthvoru horni. Þetta gerir notendum kleift að sérsníða virkni síðunnar að sínum þörfum og gefur aukinn sveigjanleika við stjórnun.

## Áframhaldandi þróun

Í framtíðinni er áætlað að bæta við fleiri eiginleikum sem munu auka bæði sveigjanleika og notendavænt viðmót. Einn mikilvægasti eiginleikinn sem verður bættur við er stuðningur fyrir Sonos "groups", sem gerir notendum kleift að sameina mörg tæki í einn hljómflokk. Þetta mun leyfa notendum að stjórna hljómi á stærra svæði eða hópi tækja með einni aðgerð. og meira user friendly semsagt spotify quick connect, user onboarding til að gera uppsetningu léttari
Einnig er áætlað að bæta við Spotify leitartæki sem leyfir notendum að finna og spila tónlist frá Spotify beint úr vefsíðunni. Með því að tryggja að metadata frá Spotify sé réttur og nákvæmur, verður upplifun notenda á tónlist minni trufluð og nákvæmni í upplýsingum mun aukast.

## leiðbeiningar
Spotify api refresh
- Ef spotify api loadast ekki ýtið þá á svg icon 2 í header semsagt svg af reload. það mun endurhlaða vefsíðuni frá grunni


## Lokaframleiðsla

Heildarvirkni síðunnar, sem samstillir Sonos tæki og gerir notendum kleift að nýta Spotify þjónustuna í rauntíma, gerir þetta verkefni að öflugu tæki fyrir þá sem vilja stýra hljómi og tónlist á einfaldan, fljótan og skilvirkan hátt. Eftir því sem fleiri eiginleikar verða bættir við, verður vefsíðan enn fullkomnari og getur boðið upp á enn fleiri möguleika í stjórnun og stjórnunartækni.
