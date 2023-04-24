from backend.lib.oldresources.dataset.AdminDataset import AdminDataset
from backend.lib.oldresources.dataset.Summary import DatasetsSummary
from backend.lib.oldresources.dataset.Examples import DatasetExample, DatasetParamsExample
from backend.lib.oldresources.dataset.FileStorage import FileStorageService, FileStorageServiceWithoutToken
from backend.lib.oldresources.dataset.Details import DatasetDetails, DatasetGroupings, DatasetExperimentalInfo, DatasetsHeatmap, DatasetsVolcano, DatasetSearch
from backend.lib.oldresources.dataset.MitoMap import DatasetsMitoMap
from backend.lib.oldresources.feature.Features import Features, FeaturesInDatasets, FeatureDetails, FeatureDBInfo, FeatureSummary
from backend.lib.oldresources.feature.cards.Correlations import CorrelationsToFeature
from backend.lib.oldresources.feature.cards.Layout import CardLayout
from backend.lib.oldresources.submission.Submissions import DataSubmissionID, DataSubmissionDetails, DataSubmissions, SampleList
from backend.lib.oldresources.filter.Filter import Filter
from backend.lib.oldresources.login.Login import LoginWebsite, TokenValid, AdminLoginWebsite, AdminLoginValidation, AdminTokenValid, AdminUser
from backend.lib.oldresources.performance.ShareToken import ShareTokenValid, ShareToken
from backend.lib.oldresources.performance.ShareData import ShareData, ShareDataDetails
from backend.lib.oldresources.ptm.PTM import PTMView, PTMItems
from backend.lib.oldresources.website.Welcome import WelcomeText
mitoCubeResources = [
    {
        "url":'/api/website/welcome',
        "obj":  WelcomeText,
        "reqKwargs" : ["data"]
    },
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
        "reqKwargs" : ["token","data"]
    },
    {
        "url":'/api/token/admin/valid',
        "obj":  AdminTokenValid,
        "reqKwargs" : ["token","user"]
    },
    {
        "url":'/api/dataset',
        "obj": FileStorageService,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/example',
        "obj": DatasetExample,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/instantclue',
        "obj": FileStorageServiceWithoutToken,
        "reqKwargs" : ["data","token"]
    },
    # {
    #     "url":'/api/dataset/data',
    #     "obj": FileStorageService,
    #     "reqKwargs" : ["data","token"]
    # },
    # {
    #     "url":'/api/dataset/params',
    #     "obj": DatasetParams,
    #     "reqKwargs" : ["data","token"]
    # },
    {
        "url":'/api/dataset/params/example',
        "obj": DatasetParamsExample,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/details',
        "obj": DatasetDetails,
        "reqKwargs" : ["data","token"]
    },
    {
        "url":'/api/dataset/features',
        "obj": DatasetSearch,
        "reqKwargs" : ["featureFinder","token"]
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
    # {
    #     "url":'/api/features/cards/data',
    #     "obj": ChartDataForFeatures,
    #     "reqKwargs" : ["data","token"]
    # },
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
        "obj": DataSubmissionID,
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
    },
    ## admin datasets
    {
        "url":'/api/admin/datasets',
        "obj": AdminDataset,
        "reqKwargs" : ["token","data"]
    },
    ##performance data sharing
    {
        "url":'/api/admin/shareToken/valid',
        "obj": ShareTokenValid,
        "reqKwargs" : ["token"]
    },
    {
        "url":'/api/admin/shareToken',
        "obj": ShareToken,
        "reqKwargs" : ["token"]
    },
        {
        "url":'/api/admin/performance',
        "obj": ShareData,
        "reqKwargs" : ["token","performance","data"]
    },
    {
        "url":'/api/admin/performance/details',
        "obj": ShareDataDetails,
        "reqKwargs" : ["token","performance"]
    },
    ## ptms
    {
        "url":'/api/ptm/items',
        "obj": PTMItems,
        "reqKwargs" : ["token","ptm"]
    },
    {
        "url":'/api/ptm',
        "obj": PTMView,
        "reqKwargs" : ["token","ptm","libs"]
    }
]



