import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <Skeleton className="h-10 w-[300px] mx-auto mb-2" />
          <Skeleton className="h-5 w-[400px] mx-auto" />
        </div>

        <div className="w-full mb-6">
          <Skeleton className="h-10 w-full mb-6" />

          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-[200px] mb-2" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>
                <Skeleton className="h-6 w-[100px]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-[150px] mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-[40px]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-5 w-[120px] mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-5 w-[120px] mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>

              <div>
                <Skeleton className="h-5 w-[150px] mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[120px]" />
                  <Skeleton className="h-6 w-[90px]" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-[180px]" />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[250px] mb-2" />
              <Skeleton className="h-4 w-[350px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Skeleton className="h-10 w-[180px]" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
