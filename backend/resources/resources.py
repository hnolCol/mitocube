from .dataset.Summary import DatasetsSummary
from .dataset.Params import DatasetParams
from .dataset.Details import DatasetDetails, DatasetGroupings, DatasetExperimentalInfo, DatasetsHeatmap, DatasetsVolcano
from .feature.Features import Features, FeaturesInDatasets, FeatureDetails, FeatureDBInfo, FeatureSummary
from .feature.cards.Data import ChartDataForFeatures, CorrelationsToFeature
from .feature.cards.Layout import CardLayout
from .submission.ID import DataID, DataSubmissionDetails
from .filter.Filter import Filter
from .login.Login import LoginWebsite, TokenValid

mitoCubeResources = [
    {
        "url":'/api/login',
        "obj":  LoginWebsite,
        "reqKwargs" : ["token","data"]
    },
    {
        "url":'/api/token/valid',
        "obj":  TokenValid,
        "reqKwargs" : ["token"]
    },
    # {
    #     "url":'/api/dataset/summary',
    #     "obj": DatasetSummary,
    #     "reqKwargs" : ["data","token"]
    # },
    {
        "url":'/api/dataset/params',
        "obj": DatasetParams,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/details',
        "obj": DatasetDetails,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/groupings',
        "obj": DatasetGroupings,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/features',
        "obj": Features,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/details',
        "obj": FeatureDetails,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/summary',
        "obj": FeatureSummary,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/datasets',
        "obj": FeaturesInDatasets,
        "reqKwargs" : ["featureFinder","token"]
    },
    {
        "url":'/api/features/cards/data',
        "obj": ChartDataForFeatures,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/features/cards/data/correlation',
        "obj": CorrelationsToFeature,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/features/cards',
        "obj": CardLayout,
        "reqKwargs" : ["data","featureFinder","token"]
    },
    {
        "url":'/api/features/db/info',
        "obj": FeatureDBInfo,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/filter/options',
        "obj": Filter,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/details/experimentalInfo',
        "obj": DatasetExperimentalInfo,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/summary',
        "obj": DatasetsSummary,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/heatmap',
        "obj": DatasetsHeatmap,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/volcano',
        "obj": DatasetsVolcano,
        "reqKwargs" : ["data","token"]
    },
    ###Sample submission
    {
        "url":'/api/data/submission/id',
        "obj": DataID,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/data/submission/details',
        "obj": DataSubmissionDetails,
        "reqKwargs" : ["data","token"]
    }
    

    
    
]



