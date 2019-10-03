# Parsing Cues

The aim is to parse the cues text into javascript objects that can then be used to construct timeline objects in the future.

## Common Interface

All cues have a type. They may have a start and an end.

```JS
interface CueDefinitionBase {
    type: CueType;
    start?: {
        frames?: number,
        seconds?: number
    };
    end?: {
        frames?: number,
        seconds?: number
    };
}
```

The blueprint will later be able to convert the frames values to seconds values. Minutes will be converted to seconds at this stage. The blueprint will also add default timing values (e.g. graphics out after 4 seconds if no end point is specified).

## kg cue

### Grafik

Effect:
Plays a graphic via Viz

Example:

```JS
'kg bund HELENE RØNBJERG KRISTENSEN',
'herk@tv2.dk',
';0.02'
```

```JS
CueDefinitionGrafik {
    type: CueType.Grafik,
    start: {
        seconds: 2
    },
    template: 'bund',
    textFields: ['HELENE RØNBJERG KRISTENSEN', 'herk@tv2.dk']
}
```

### All out

Effect:
Clears all Viz graphics

Example:

```JS
"kg ovl-all-out",
"CLEAR OVERLAY",
";0.00"
```

This will be handled by the baseline but could be stored as:

```JS
CueDefinitionIgnored_MOS {
    type: CueType.Ingored_MOS,
    command: ['kg ovl-all-out', 'CLEAR OVERLAY', ';0.00']
}
```

This will allow us to keep track of ignored commands for analysing shows after air for problems.

## DIGI

Same as [kg cue](#kg-cue)

Example:

```JS
"DIGI=VO",
"Dette er en VO tekst",
"Dette er linje 2",
";0.00"
```

```JS
CueDefinitionGrafik {
    type: CueType.Grafik,
    start: {
        seconds: 0
    },
    template: 'VO',
    textFields: ['Dette er en VO tekst', 'Dette er linje 2']
}
```

## VIZ cue

Example:

```JS
"VIZ=grafik-design",
"triopage=DESIGN_SC",
";0.00.04"
```

```JS
CueDefinitionVIZ {
    type: CueType.VIZ,
    start: {
        frames: 4
    },
    vizCue: VizCueType.GrafikDesign,
    content: {'triopage': 'DESIGN_SC'}
}
```

Example:

```JS
"KG=DESIGN_FODBOLD",
";0.00.01"
```

```JS
CueDefinitionVIZ {
    type: CueType.VIZ,
    start: {
        frames: 1
    },
    // Need help here
}
```

## MOS Objects

Effect: Triggers an object from the pilotdb

Example:

```JS
[
    "]] S3.0 M 0 [[",
    "cg4 ]] 2 YNYAB 0 [[ pilotdata",
    "TELEFON/KORT//LIVE_KABUL",
    "VCPID=2552305",
    "ContinueCount=3",
    "TELEFON/KORT//LIVE_KABUL"
]
```

```JS
CueDefinitionMOS {
    type: CueType.MOS,
    name: "TELEFON/KORT//LIVE_KABUL",
    vcpid: 2552305,
    continueCount: 3
}
```

## EKSTERN

Effect: Switches to an external source.

Example:

```JS
"EKSTERN=LIVE 1"
```

```JS
CueDefinitionEkstern {
    type: CueType.Ekstern,
    source: 'LIVE 1'
}
```

## DVE

Effect: Creates a DVE of a given layout.

```JS
"DVE=sommerfugl",
"INP1=KAM 1",
"INP2=LIVE 1",
"BYNAVN=Odense/København"
```

```JS
CueDefinitionDVE {
    type: CueType.DVE,
    template: 'sommerfugl', // Possible value: sommerfugl, morbarn, barnmor, 1til2, 2til1, 2gæst
    sources: ['KAM 1', 'LIVE 1'],
    labels: ['Odense', 'København'] // Right, left
}
```

## Telefon

Effect: Switches to a telephone source.

A Telefon object may contain a VIZ object.

Example:

```JS
"TELEFON=TLF 2",
"(Gem VIZ navn her)"
```

```JS
CueDefinitionTelefon {
    type: CueType.Telefon,
    source: 'TLF 2',
    vizObj: CueDefinitionGrafik
}
```

## Kommando

Effect: Sends commands to Mosart

Example:

```JS
"KOMMANDO=GRAPHICSPROFILE",
"TV2 SPORT 2016",
";0.00"
```

```JS
CueDefinitionVIZ {
    type: CueType.VIZ,
    start: {
        seconds: 0
    },
    // Need help here
}
```

## Studio Setup

Effect: Selects which studio is in use.

Example:

```JS
"STUDIOSETUP=afvikling C",
";0.00"
```

This cue is special, and requires separate discussion as it involves switching the active studio in Sofie.

## Studio Cameras

Effect: Sets the primary/secondary cameras.

```JS
"STUDIE=ST4p",
";0.01"
```

Needs further discussion.

## Studio Mics

Effect: Sets the state of the studio mics.

Example:

```JS
"STUDIE=MIC ON OFF",
"ST2vrt1=OFF",
"ST2vrt2=OFF",
"ST2gst1=OFF",
"ST2gst2=OFF",
"kom1=OFF",
"kom2=OFF",
"ST4vrt=ON",
"ST4gst=",
";0.00"
```

```JS
CueDefinitionMic {
    type: CueType.Mic,
    start: {
        seconds: 0
    },
    mics: {
        'ST2vrt1': false, // OFF
        'ST2vrt2': false,
        'ST2gst1': false,
        'ST2gst2': false,
        'kom1': false,
        'kom2': false,
        'ST4vrt': true, // ON
        'ST4gst': false
    }
}
```

## AdLib

Effect: Creates an AdLib element.

Example:

```Js
"ADLIBPIX=MORBARN",
"INP1=LIVE 1",
"BYNAVN="
```

```JS
CueDefinitionAdLib {
    type: CueType.AdLib,
    variant: 'morbarn', // Possible values: morbarn, server, barnmor, 1til2,  2til1
    input: 'LIVE 1'
}
```
