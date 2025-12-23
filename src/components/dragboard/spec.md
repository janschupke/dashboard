Requirements:
- encapsulated, reusable component, does not leak implementation to the rest of the app
- tiles can be re-arranged, added from sidebar by clicking item or drag
- items can be removed by clicking the X button
- they always re-arrange so that no empty gaps remain
- all tiles on the same row stretch to fit the tallest
- tiles stretch to fit container width
- column amount is dynamic, based on viewport width
- tiles min dimensions are 250px wide, 200px high

Tech requirements
- no hardcoded garbage
- use tailwind and grid layout
- keep logic and presentation separate
- keep components small
- separation of concerns
- no hardcoded values - use constants and enums
- write unit tests
