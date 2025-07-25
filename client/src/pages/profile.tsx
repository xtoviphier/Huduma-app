import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Edit, Star, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";

export default function Profile() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock user data - in real app this would come from auth context
  const userId = "current-user-id";
  
  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs", userId],
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites", userId],
  });

  const stats = [
    { label: t('jobsCompleted'), value: "12", color: "text-kenyan-red" },
    { label: t('averageRating'), value: "4.8", color: "text-kenyan-green" },
    { label: t('savedProviders'), value: "5", color: "text-yellow-600" },
    { label: t('activeJobs'), value: "2", color: "text-blue-600" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl font-semibold">JD</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">John Doe</h1>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>{t('edit')}</span>
                  </Button>
                </div>
                <div className="space-y-1 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+254 700 123 456</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>john.doe@example.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Mombasa, Kenya</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('recentJobs')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-kenyan-red/10 rounded-full flex items-center justify-center">
                          <i className="fas fa-wrench text-kenyan-red"></i>
                        </div>
                        <div>
                          <h5 className="font-semibold">{job.title || "Service Request"}</h5>
                          <p className="text-sm text-gray-600">Provider Name • {new Date(job.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-kenyan-green font-semibold">KES {job.finalPrice || "1,200"}</div>
                        <div className={`text-sm ${
                          job.status === 'completed' ? 'text-green-600' : 
                          job.status === 'in_progress' ? 'text-blue-600' : 
                          'text-yellow-600'
                        }`}>
                          {job.status === 'completed' ? t('completed') : 
                           job.status === 'in_progress' ? t('inProgress') : 
                           'Pending'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold">{job.title || "Service Request"}</h5>
                          <p className="text-sm text-gray-600">{job.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-kenyan-green font-semibold">
                            KES {job.finalPrice || "N/A"}
                          </div>
                          <div className={`text-sm px-2 py-1 rounded ${
                            job.status === 'completed' ? 'bg-green-100 text-green-600' : 
                            job.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {job.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>{t('savedProviders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {favorites.map((favorite, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                          <h5 className="font-semibold">
                            {favorite.provider?.user?.firstName} {favorite.provider?.user?.lastName}
                          </h5>
                          <p className="text-sm text-gray-600">{favorite.provider?.category?.name}</p>
                          <div className="flex items-center space-x-1 text-sm text-yellow-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{favorite.provider?.rating}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="bg-kenyan-red hover:bg-red-700 text-white">
                        {t('contact')}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
