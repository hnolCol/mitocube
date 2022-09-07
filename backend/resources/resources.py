from .dataset.Summary import DatasetsSummary
from .dataset.Params import DatasetParams
from .dataset.Details import DatasetDetails, DatasetGroupings, DatasetExperimentalInfo, DatasetsHeatmap, DatasetsVolcano
from .dataset.MitoMap import DatasetsMitoMap
from .feature.Features import Features, FeaturesInDatasets, FeatureDetails, FeatureDBInfo, FeatureSummary
from .feature.cards.Data import ChartDataForFeatures, CorrelationsToFeature
from .feature.cards.Layout import CardLayout
from .submission.ID import DataID, DataSubmissionDetails, DataSubmissions, SampleList
from .filter.Filter import Filter
from .login.Login import LoginWebsite, TokenValid, AdminLoginWebsite, AdminLoginValidation, AdminTokenValid, AdminUser

mitoCubeResources = [
    {
        "url":'/api/login',
        "obj":  LoginWebsite,
        "reqKwargs" : ["token","data"]
    },
        {
        "url":'/api/login/admin',
        "obj":  AdminLoginWebsite,
        "reqKwargs" : ["token","data","email","user"]
    },
    {
        "url":'/api/login/admin/validate',
        "obj":  AdminLoginValidation,
        "reqKwargs" : ["token"]
    },

    
    {
        "url":'/api/token/valid',
        "obj":  TokenValid,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/token/admin/valid',
        "obj":  AdminTokenValid,
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
    ### Mitomap
    {
        "url":'/api/data/mitomap',
        "obj": DatasetsMitoMap,
        "reqKwargs" : ["data","token"]
    },
    ###Sample submission
    {
        "url":'/api/data/submission/id',
        "obj": DataID,
        "reqKwargs" : ["data","token","submission"]
    },
    {
        "url":'/api/data/submission/details',
        "obj": DataSubmissionDetails,
        "reqKwargs" : ["data","token","email","submission"]
    },
    {
        "url":'/api/admin/submissions',
        "obj": DataSubmissions,
        "reqKwargs" : ["token","submission"]
    },
    ### Admin Users
    {
        "url":'/api/admin/users',
        "obj": AdminUser,
        "reqKwargs" : ["token","user"]
    },
    ### Sample list
    {
        "url":'/api/admin/samplelist',
        "obj": SampleList,
        "reqKwargs" : ["token","submission"]
    }
    
]



